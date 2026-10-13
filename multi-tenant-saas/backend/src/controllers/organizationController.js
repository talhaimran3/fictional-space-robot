import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Return one organization with safe staff fields.
 * Tenant authorization is applied by organizationRoutes.js.
 */
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
            SELECT json_agg(jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'full_name', u.full_name,
              'role', u.role,
              'organization_id', u.organization_id,
              'status', u.status
            ) ORDER BY u.full_name)
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
    return res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
