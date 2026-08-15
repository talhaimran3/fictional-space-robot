import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

export const addCompany = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const queryText = `
            INSERT INTO organizations (name, slug)
            VALUES ($1, $2)
            RETURNING id, name, slug, created_at;
        `;
    const { rows } = await db.query(queryText, [name, slug]);
    res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name, slug,created_at
      FROM organizations
      ORDER BY created_at DESC;
    `;

    const { rows } = await db.query(queryText);

    console.log("Fetched companies:", rows.map((row) => row.name));
    res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name,
organization_id, email, created_at , platform_role
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
      SELECT id, organization_id, name, start_time, end_time, created_at
      FROM shifts
      ORDER BY created_at DESC;
    `;

    const result = await db.query(queryText);
    // console.log("Fetched shifts:", result.rows);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};