import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import db from "../config/database.js";
import {
  deleteLocalProfileImage,
  getLocalProfileImageUrl,
  saveLocalProfileImage,
} from "../utils/localProfileStorage.js";

const profileImageUrl = async (key, req) => {
  if (!key) return null;
  try {
    return await getLocalProfileImageUrl(key, req);
  } catch {
    return null;
  }
};

const safeEmployee = async (row, req) => ({
  id: row.id,
  email: row.email,
  full_name: row.full_name,
  role: row.role,
  organization_id: row.organization_id,
  phone: row.phone || null,
  hourly_rate: row.hourly_rate ?? null,
  status: row.status,
  profile_image_url: await profileImageUrl(row.profile_image_key, req),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const getAllEmployees = async (req, res) => {
  try {
    const isDeveloper = req.user.role === "developer";
    const organizationId = req.user.organizationId || null;
    const queryText = `
      SELECT
        u.id, u.email, u.full_name, u.role, u.organization_id,
        u.phone, u.hourly_rate, u.profile_image_key, u.status,
        u.created_at, u.updated_at,
        jsonb_build_object('id', o.id, 'name', o.name, 'slug', o.slug) AS organization,
        COALESCE(
          (SELECT json_agg(to_jsonb(s) ORDER BY s.start_time DESC)
           FROM shifts s WHERE s.employee_id = u.id AND s.organization_id = u.organization_id),
          '[]'::json
        ) AS shifts
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE ($1::boolean = TRUE OR u.organization_id = $2::uuid)
      ORDER BY u.created_at DESC;
    `;
    const { rows } = await db.query(queryText, [isDeveloper, organizationId]);
    return res.status(200).json({ success: true, employees: await Promise.all(rows.map((row) => safeEmployee(row, req))) });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, full_name, role, organization_id, phone,
              profile_image_key, status, created_at, updated_at
       FROM users WHERE id = $1 LIMIT 1`,
      [req.user.id],
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, employee: await safeEmployee(result.rows[0], req) });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return res.status(500).json({ success: false, message: "Unable to load your profile." });
  }
};

export const updateMyProfile = async (req, res) => {
  const { full_name, email, phone } = req.body || {};
  if (full_name === undefined && email === undefined && phone === undefined) {
    return res.status(400).json({ error: "Provide a name, email, or phone number to update." });
  }
  if (full_name !== undefined && (typeof full_name !== "string" || !full_name.trim())) {
    return res.status(400).json({ error: "Name cannot be empty." });
  }
  if (email !== undefined && (typeof email !== "string" || !email.trim())) {
    return res.status(400).json({ error: "Email cannot be empty." });
  }
  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    return res.status(400).json({ error: "Phone number must be text." });
  }

  try {
    const result = await db.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = CASE WHEN $3::boolean THEN $4 ELSE phone END,
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, full_name, role, organization_id, phone,
                 profile_image_key, status, created_at, updated_at`,
      [
        full_name === undefined ? null : full_name.trim(),
        email === undefined ? null : email.trim().toLowerCase(),
        phone !== undefined,
        phone === undefined ? null : (phone.trim() || null),
        req.user.id,
      ],
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ success: true, employee: await safeEmployee(result.rows[0], req) });
  } catch (error) {
    console.error("Failed to update profile:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "That email address is already in use." });
    }
    return res.status(500).json({ error: "Unable to update your profile." });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[contentType];
  const body = req.body;

  if (!extension || !Buffer.isBuffer(body) || body.length === 0) {
    return res.status(400).json({ error: "Upload a JPEG, PNG, or WebP image." });
  }
  if (body.length > 5 * 1024 * 1024) {
    return res.status(413).json({ error: "Profile pictures must be 5 MB or smaller." });
  }

  let savedKey = null;
  try {
    const current = await db.query(
      "SELECT profile_image_key FROM users WHERE id = $1",
      [req.user.id],
    );
    if (!current.rows.length) {
      return res.status(404).json({ error: "User not found." });
    }

    const oldKey = current.rows[0].profile_image_key;
    const key = crypto.randomUUID() + "." + extension;
    savedKey = await saveLocalProfileImage(key, body);

    const result = await db.query(
      `UPDATE users
       SET profile_image_key = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, full_name, role, organization_id, phone,
                 profile_image_key, status, created_at, updated_at`,
      [savedKey, req.user.id],
    );

    if (!result.rows.length) {
      await deleteLocalProfileImage(savedKey);
      return res.status(404).json({ error: "User not found." });
    }

    if (oldKey) {
      try {
        await deleteLocalProfileImage(oldKey);
      } catch (deleteError) {
        console.warn("Old profile picture could not be removed:", deleteError.message);
      }
    }

    return res.json({ success: true, employee: await safeEmployee(result.rows[0], req) });
  } catch (error) {
    if (savedKey) {
      try {
        await deleteLocalProfileImage(savedKey);
      } catch (cleanupError) {
        console.warn("New profile picture cleanup failed:", cleanupError.message);
      }
    }
    console.error("Profile picture upload failed:", error);
    return res.status(500).json({ error: "Unable to upload your profile picture." });
  }
};

export const addEmployee = async (req, res) => {
  const {
    organization_id,
    name,
    email,
    role = "staff",
    password,
    phone = null,
    hourly_rate = null,
  } = req.body || {};

  if (!organization_id || !name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: "Organization, name, email and password are required.",
    });
  }
  if (!["staff", "manager", "admin", "developer"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid user role." });
  }

  try {
    const orgCheck = await db.query(
      "SELECT id FROM organizations WHERE id = $1 AND status = 'active'",
      [organization_id],
    );
    if (!orgCheck.rows.length) {
      return res.status(404).json({ success: false, message: "Organization not found or inactive." });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email.trim()],
    );
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    if (hourly_rate !== null && hourly_rate !== "" && (!Number.isFinite(Number(hourly_rate)) || Number(hourly_rate) < 0)) {
      return res.status(400).json({ success: false, message: "Hourly rate must be a non-negative number." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, password_hash, password, full_name, role, organization_id, phone, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, full_name, role, organization_id, phone, hourly_rate, created_at`,
      [
        email.trim().toLowerCase(),
        hashed,
        hashed,
        name.trim(),
        role,
        organization_id,
        phone,
        hourly_rate === "" || hourly_rate === null ? null : Number(hourly_rate),
      ],
    );

    return res.status(201).json({ success: true, employee: result.rows[0] });
  } catch (error) {
    console.error("Error adding user:", error);
    if (error.code === "22P02") {
      return res.status(400).json({ success: false, message: "Invalid organization or role." });
    }
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the user.",
    });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { organization_id, full_name, role, email, phone, hourly_rate } = req.body || {};
  if (hourly_rate !== undefined && hourly_rate !== null && hourly_rate !== "" &&
      (!Number.isFinite(Number(hourly_rate)) || Number(hourly_rate) < 0)) {
    return res.status(400).json({ success: false, message: "Hourly rate must be a non-negative number." });
  }

  try {
    const queryText = `
      UPDATE users
      SET organization_id = COALESCE($1, organization_id),
          full_name = COALESCE($2, full_name),
          role = COALESCE($3, role),
          email = COALESCE($4, email),
          phone = CASE WHEN $5::boolean THEN $6 ELSE phone END,
          hourly_rate = CASE WHEN $7::boolean THEN $8::numeric ELSE hourly_rate END,
          updated_at = NOW()
      WHERE id = $9
      RETURNING id, email, full_name, role, organization_id, phone, hourly_rate,
                status, created_at, updated_at;
    `;
    const { rows } = await db.query(queryText, [
      organization_id || null,
      full_name?.trim() || null,
      role || null,
      email?.trim() ? email.trim().toLowerCase() : null,
      phone !== undefined,
      phone === undefined ? null : (phone?.trim() || null),
      hourly_rate !== undefined,
      hourly_rate === "" || hourly_rate === null ? null : Number(hourly_rate),
      id,
    ]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user.",
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [req.params.id],
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message: "This user is still referenced by historical records. Deactivate the account instead of deleting it.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user.",
    });
  }
};
