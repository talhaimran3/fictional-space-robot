import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

export const addorganization = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const created_by = req.user.id;

    const queryText = `
      INSERT INTO organizations (name, slug, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug, created_by, created_at;
    `;

    const { rows } = await db.query(queryText, [name, slug, created_by]);
    res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const queryText = `
      UPDATE organizations
      SET name = $1, slug = $2
      WHERE id = $3::uuid
      RETURNING id, name, slug, created_by, created_at;
    `;

    const result = await db.query(queryText, [name, slug, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
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
    res.json({ data: rows });
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
    res.json({ data: result.rows });
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
    res.json({ data: result.rows, counts: countsResult.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
