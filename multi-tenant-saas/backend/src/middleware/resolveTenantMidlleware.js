// middleware/tenantMiddleware.js

import db from "../config/database.js";

export const resolveTenant = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Organization slug is required",
      });
    }

    const userId = req.user.id;

    const { rows } = await db.query(
      `
        SELECT
          o.id,
          o.name,
          o.slug,
          o.timezone,
          o.status,
          om.role
        FROM organizations o

        INNER JOIN organization_members om
          ON om.organization_id = o.id

        WHERE o.slug = $1
          AND om.user_id = $2
      `,
      [slug, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization",
      });
    }

    const organization = rows[0];

    if (organization.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Organization is not active",
      });
    }

    req.organization = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      timezone: organization.timezone,
    };

    req.membership = {
      role: organization.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};