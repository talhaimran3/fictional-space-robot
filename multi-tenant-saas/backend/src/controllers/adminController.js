import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

export const addorganization = async (req, res) => {
  try {
    const { name, slug, status } = req.body;
    const queryText = `
            INSERT INTO organizations (name, slug, status)
            VALUES ($1, $2, $3)
            RETURNING id, name, slug, status, created_at;
        `;

    const { rows } = await db.query(queryText, [name, slug, status]);
    console.log("Added organization:", rows[0]);
    res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const editOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, timezone, status } = req.body;
    // check if the user has the right to edit the organization
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const queryText = `
      UPDATE organizations
      SET name = $1,
          slug = $2,
          timezone = $3,
          status = $4,
          updated_at = NOW()
      WHERE id = $5::uuid
      RETURNING id, name, slug, timezone, status, created_at, updated_at;
    `;

    const result = await db.query(queryText, [name, slug, timezone, status, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "organization not found" });
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
        o.timezone,
        o.status,
        o.created_at,
        o.updated_at,
        COALESCE(
          (SELECT json_agg(om.*) FROM employees om WHERE om.organization_id = o.id), 
          '[]'::json
        ) AS employees,
        COALESCE(
          (SELECT json_agg(s.*) FROM shifts s WHERE s.organization_id = o.id), 
          '[]'::json
        ) AS shifts
      FROM organizations o
      ORDER BY o.created_at DESC;
    `;

    const { rows } = await db.query(queryText);

    console.log("Fetched organizations:", rows.map((row) => row.name));
    res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const queryText = `
      SELECT id,
        email,
        name,
        phone,
        avatar_url,
        created_at,
        updated_at,
        password,
        is_email_verified,
        role
      FROM users
      ORDER BY created_at DESC;
    `;

    const result = await db.query(queryText);
    console.log("Fetched users:", result.rows.map((row) => row.name));
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
    
  s.id,
  s.organization_id,
  s.employee_id,
  s.title,
  s.start_time,
  s.end_time,
  s.total_hours,
  s.status,
  s.notes,
  s.created_at,
  s.updated_at,
  e.employee_code,
  e.role AS employee_role,
  u.name AS employee_name,        -- change to u.full_name if that’s your column
  u.email AS employee_email
FROM shifts s
LEFT JOIN employees e ON e.id = s.employee_id
LEFT JOIN users u ON u.id = e.user_id
ORDER BY s.start_time ASC;
    `;


    const result = await db.query(queryText);
    // console.log("Fetched shifts:", result.rows);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};