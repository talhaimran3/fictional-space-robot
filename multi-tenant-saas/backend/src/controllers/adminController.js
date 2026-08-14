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
