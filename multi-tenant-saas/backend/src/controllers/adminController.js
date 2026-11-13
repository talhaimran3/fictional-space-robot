import db from "../config/database.js";
import { organizationEmail } from "../templates/emailTemplates.js";
import { sendEmailSafely } from "../services/emailNotificationService.js";

const notifyDeveloper = async (user, action, organization) => {
  if (!user?.email) return;
  await sendEmailSafely({
    to: user.email,
    ...organizationEmail({ action, actor: user, organization }),
  });
};

const getOrganizationInput = (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const slug = typeof req.body?.slug === "string" ? req.body.slug.trim().toLowerCase() : "";

  if (name.length < 2 || !slug) {
    res.status(400).json({ error: "Organization name must be at least 2 characters and slug is required." });
    return null;
  }

  if (slug.length < 2 || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).json({
      error: "Slug must be at least 2 characters and contain only lowercase letters, numbers, or hyphens.",
    });
    return null;
  }

  return { name, slug };
};

export const addorganization = async (req, res) => {
  try {
    const input = getOrganizationInput(req, res);
    if (!input) return;
    const { name, slug } = input;
    const created_by = req.user.id;

    const { rows } = await db.query(
      `INSERT INTO organizations (name, slug, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, status, created_by, created_at;`,
      [name, slug, created_by],
    );

    await notifyDeveloper(req.user, "created", rows[0]);
    return res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "An organization with this name or slug already exists." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const input = getOrganizationInput(req, res);
    if (!input) return;
    const { name, slug } = input;

    const result = await db.query(
      `UPDATE organizations
       SET name = $1, slug = $2
       WHERE id = $3::uuid
       RETURNING id, name, slug, status, created_by, created_at;`,
      [name, slug, id],
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Organization not found" });
    }

    await notifyDeveloper(req.user, "updated", result.rows[0]);
    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "An organization with this name or slug already exists." });
    }
    if (error.code === "22P02") {
      return res.status(400).json({ error: "Invalid organization ID." });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deactivateOrganization = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE organizations
       SET status = 'inactive'
       WHERE id = $1::uuid AND status = 'active'
       RETURNING id, name, slug, status, created_by, created_at;`,
      [req.params.id],
    );

    if (!result.rows.length) {
      const exists = await db.query("SELECT id, status FROM organizations WHERE id = $1::uuid", [req.params.id]);
      if (!exists.rows.length) return res.status(404).json({ error: "Organization not found." });
      return res.status(409).json({ error: "Organization is already inactive." });
    }

    await notifyDeveloper(req.user, "deactivated", result.rows[0]);
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Failed to deactivate organization:", error);
    if (error.code === "22P02") return res.status(400).json({ error: "Invalid organization ID." });
    return res.status(500).json({ error: "Unable to deactivate organization." });
  }
};

export const reactivateOrganization = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE organizations
       SET status = 'active'
       WHERE id = $1::uuid AND status = 'inactive'
       RETURNING id, name, slug, status, created_by, created_at;`,
      [req.params.id],
    );

    if (!result.rows.length) {
      const exists = await db.query("SELECT id, status FROM organizations WHERE id = $1::uuid", [req.params.id]);
      if (!exists.rows.length) return res.status(404).json({ error: "Organization not found." });
      return res.status(409).json({ error: "Organization is already active." });
    }

    await notifyDeveloper(req.user, "reactivated", result.rows[0]);
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Failed to reactivate organization:", error);
    if (error.code === "22P02") return res.status(400).json({ error: "Invalid organization ID." });
    return res.status(500).json({ error: "Unable to reactivate organization." });
  }
};

export const getAllorganizations = async (req, res) => {
  try {
    const isDeveloper = req.user.role === "developer";
    const organizationId = req.user.organizationId || null;

    const queryText = `
      SELECT
        o.id,
        o.name,
        o.slug,
        o.status,
        o.created_by,
        o.created_at,
        COALESCE(
          (
            SELECT json_agg(jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'full_name', u.full_name,
              'role', u.role,
              'organization_id', u.organization_id,
              'status', u.status
            ))
            FROM users u
            WHERE u.organization_id = o.id
          ),
          '[]'::json
        ) AS members,
        COALESCE(
          (SELECT json_agg(s.*) FROM shifts s WHERE s.organization_id = o.id),
          '[]'::json
        ) AS shifts
      FROM organizations o
      WHERE ($1::boolean = TRUE OR o.id = $2::uuid)
      ORDER BY o.created_at DESC;
    `;

    const { rows } = await db.query(queryText, [isDeveloper, organizationId]);
    return res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const isDeveloper = req.user.role === "developer";
    const organizationId = req.user.organizationId || null;
    const queryText = `
      SELECT id, email, full_name, role, organization_id, created_at, updated_at
      FROM users
      WHERE ($1::boolean = TRUE OR organization_id = $2::uuid)
      ORDER BY created_at DESC;
    `;
    const result = await db.query(queryText, [isDeveloper, organizationId]);
    return res.json({ data: result.rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllShifts = async (req, res) => {
  try {
    const isDeveloper = req.user.role === "developer";
    const organizationId = req.user.organizationId || null;
    const queryText = `
      SELECT s.*, u.full_name AS employee_name, u.email AS employee_email,
             u.role AS employee_role
      FROM shifts s
      LEFT JOIN users u ON u.id = s.employee_id
      WHERE ($1::boolean = TRUE OR s.organization_id = $2::uuid)
      ORDER BY s.start_time ASC;
    `;
    const countsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE employee_id IS NULL AND status != 'cancelled') AS unassigned_shifts,
        COUNT(*) FILTER (WHERE employee_id IS NOT NULL AND status != 'cancelled') AS assigned_shifts
      FROM shifts
      WHERE ($1::boolean = TRUE OR organization_id = $2::uuid);
    `;
    const [result, countsResult] = await Promise.all([
      db.query(queryText, [isDeveloper, organizationId]),
      db.query(countsQuery, [isDeveloper, organizationId]),
    ]);
    return res.json({ data: result.rows, counts: countsResult.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
