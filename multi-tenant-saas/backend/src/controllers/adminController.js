import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

export const addorganization = async (req, res) => {
  try {
    const { name, slug, created_by } = req.body;

    const queryText = `
      INSERT INTO organizations (name, slug, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug, created_by, created_at;
    `;

    const { rows } = await db.query(queryText, [
      name,
      slug,
      created_by || null,
    ]);

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

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const queryText = `
      UPDATE organizations
      SET name = $1,
          slug = $2
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
    const queryText = `
      SELECT
        o.id,
        o.name,
        o.slug,
        o.created_by,
        o.created_at,
        COALESCE(
          (SELECT json_agg(u.*) FROM users u WHERE u.organization_id = o.id),
          '[]'::json
        ) AS members,
        COALESCE(
          (SELECT json_agg(s.*) FROM shifts s WHERE s.organization_id = o.id),
          '[]'::json
        ) AS shifts
      FROM organizations o
      ORDER BY o.created_at DESC;
    `;

    const { rows } = await db.query(queryText);
    res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const queryText = `
      SELECT
        id,
        email,
        full_name,
        role,
        organization_id,
        created_at,
        updated_at
        -- deliberately omit password_hash
      FROM users
      ORDER BY created_at DESC;
    `;

    const result = await db.query(queryText);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllShifts = async (req, res) => {
  try {
    const queryText = `
      SELECT
        s.*,
        u.full_name AS employee_name,
        u.email AS employee_email,
        u.role AS employee_role
      FROM shifts s
      LEFT JOIN users u ON u.id = s.employee_id
      ORDER BY s.start_time ASC;
    `;

    const result = await db.query(queryText);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};