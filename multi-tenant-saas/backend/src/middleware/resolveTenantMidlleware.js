// multi-tenant-saas/backend/src/middleware/resolveTenantMidlleware.js
import db from "../config/database.js";

export const resolveTenant = async (req, res, next) => {
  try {
    const tenantId = req.headers["x-tenant-id"];

    if (!tenantId) {
      return res.status(400).json({
        message: "X-Tenant-ID header is required",
      });
    }

    const result = await db.query(
      `
            SELECT id, name, slug
            FROM organizations
            WHERE id = $1
            `,
      [tenantId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    req.tenant = result.rows[0];

    next();
  } catch (error) {
    next(error);
  }
};
