//multi-tenant-saas/backend/src/repositories/tenant.repository.js
import db from "../config/database.js";
export async function createTenant(name, slug) {
  const sql = `
    INSERT INTO tenants (name, slug)
    VALUES ($1, $2)
    RETURNING id, name, slug, created_at;
  `;
  const result = await db.query(sql, [name, slug]);
  return result.rows[0];
}
