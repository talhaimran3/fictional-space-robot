import db from "../config/database.js";

export const requireOrganizationAccess = async (req, res, next) => {
  const organizationId = req.params.organizationId || req.params.id;

  if (!organizationId) {
    return res.status(400).json({ success: false, message: "Organization ID is required." });
  }

  if (req.user?.role === "developer") {
    req.organizationId = organizationId;
    return next();
  }

  try {
    const result = await db.query(
      `SELECT id, name, slug, created_at
       FROM organizations
       WHERE id = $1
         AND status = 'active'
         AND EXISTS (
           SELECT 1 FROM users
           WHERE users.id = $2
             AND users.organization_id = organizations.id
         )`,
      [organizationId, req.user.userId || req.user.id]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this organization.",
      });
    }

    req.organizationId = organizationId;
    req.organization = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};
