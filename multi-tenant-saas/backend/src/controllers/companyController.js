//multi-tenant-saas/backend/src/controllers/companyController.js
import db from "../config/database.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * GET COMPANIES: Fetch all companies
 * Endpoint: GET /api/companies
 */

export const getAllCompanies = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name, slug,created_at , organization_members,shifts
      FROM organizations
      ORDER BY created_at DESC;
    `;

    const { rows } = await db.query(queryText);
    console.log("Fetched companies:", rows);
    res.json({ data: rows });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching company with ID:", id);
    const queryText = `
      SELECT id, name, slug, created_at
      FROM organizations
      WHERE id = $1;
    `;

    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Database query failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}