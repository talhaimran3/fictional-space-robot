import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * GET /api/organizations
 * Returns organizations + their users (staff/managers) + shifts
 */
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
          (
            SELECT json_agg(to_jsonb(u) ORDER BY u.full_name)
            FROM users u
            WHERE u.organization_id = o.id
          ),
          '[]'::json
        ) AS members,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(s) ORDER BY s.start_time)
            FROM shifts s
            WHERE s.organization_id = o.id
          ),
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

export const getorganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      SELECT
        o.id,
        o.name,
        o.slug,
        o.created_by,
        o.created_at,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(u) ORDER BY u.full_name)
            FROM users u
            WHERE u.organization_id = o.id
          ),
          '[]'::json
        ) AS members
      FROM organizations o
      WHERE o.id = $1;
    `;

    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};