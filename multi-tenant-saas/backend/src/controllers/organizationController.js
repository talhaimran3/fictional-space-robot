//multi-tenant-saas/backend/src/controllers/organizationController.js
import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * GET organizations: Fetch all organizations
 * Endpoint: GET /api/organizations
 */

export const getAllorganizations = async (req, res) => {
  try {
    const queryText = `
      SELECT o.id,
        o.name, 
        o.slug, 
        o.timezone,
        o.status,
        o.created_at,
        o.updated_at,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(s) ORDER BY s.id)
            FROM shifts s
            WHERE s.organization_id = o.id
          ),
          '[]'::json
        ) AS shifts,
        COALESCE(
          (
            SELECT json_agg(to_jsonb(e) ORDER BY e.id)
            FROM employees e
            WHERE e.organization_id = o.id
          ),
          '[]'::json
        ) AS employees
      FROM organizations o
      ORDER BY o.created_at DESC;
    `;

    const { rows } = await db.query(queryText);
    console.log("Fetched organizations:", rows);
    res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getorganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching organization with ID:", id);
    const queryText = `
      SELECT id, name, slug, created_at
      FROM organizations
      WHERE id = $1;
    `;

    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "organization not found" });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
