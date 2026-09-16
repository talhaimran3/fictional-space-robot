import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * GET all users (developer / super-admin view)
 */
export const getAllEmployees = async (req, res) => {
  try {
    const queryText = `
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.organization_id,
        u.created_at,
        u.updated_at,
        jsonb_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug
        ) AS organization,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(s) ORDER BY s.start_time DESC)
            FROM shifts s
            WHERE s.employee_id = u.id
          ),
          '[]'::json
        ) AS shifts
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      ORDER BY u.created_at DESC;
    `;

    const { rows } = await db.query(queryText);

    return res.status(200).json({
      success: true,
      employees: rows, // kept key name for frontend compatibility
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users.",
    });
  }
};

/**
 * ADD a user to an organization (acts as “add employee”)
 */
export const addEmployee = async (req, res) => {
  const {
    organization_id,
    name,
    email,
    role = "staff",
    password, // optional – if omitted a random one can be generated later
  } = req.body;

  if (!organization_id || !name?.trim() || !email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Organization, name and email are required.",
    });
  }

  try {
    // 1. Check organization exists
    const orgCheck = await db.query(
      `SELECT id FROM organizations WHERE id = $1`,
      [organization_id]
    );
    if (orgCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    // 2. Check if email already exists
    const existing = await db.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    // 3. Create user
    const hashed =
      password
        ? await (await import("bcryptjs")).hash(password, 10)
        : null;

    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, organization_id, created_at`,
      [
        email.trim().toLowerCase(),
        hashed,
        name.trim(),
        role,
        organization_id,
      ]
    );

    return res.status(201).json({
      success: true,
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the user.",
    });
  }
};

/**
 * UPDATE user
 */
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { organization_id, full_name, role, email } = req.body;

  try {
    const queryText = `
      UPDATE users
      SET
        organization_id = COALESCE($1, organization_id),
        full_name       = COALESCE($2, full_name),
        role            = COALESCE($3, role),
        email           = COALESCE($4, email),
        updated_at      = NOW()
      WHERE id = $5
      RETURNING id, email, full_name, role, organization_id, created_at, updated_at;
    `;

    const { rows } = await db.query(queryText, [
      organization_id || null,
      full_name || null,
      role || null,
      email ? email.trim().toLowerCase() : null,
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      employee: rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user.",
    });
  }
};

/**
 * DELETE user
 */
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user.",
    });
  }
};