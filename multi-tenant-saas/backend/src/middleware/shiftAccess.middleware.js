import db from "../config/database.js";

export const allowOrganizationShiftRead = (req, res, next) => {
  const requestedOrganizationId = req.params.id;
  const userOrganizationId = req.user?.organizationId;

  if (
    req.user?.role === "developer" ||
    (userOrganizationId && userOrganizationId === requestedOrganizationId)
  ) {
    return next();
  }

  return res.status(403).json({
    error: "You do not have access to shifts for this organization.",
  });
};

export const requireDeveloper = (req, res, next) => {
  if (req.user?.role === "developer") {
    return next();
  }

  return res.status(403).json({
    error: "Only developers can manage shifts at this stage.",
  });
};

/**
 * Interim staff policy: developers manage any organization; organization
 * owners/admins/managers can manage staff only within their own organization.
 * The uploaded schema currently omits "owner" from users.role's enum, so owner
 * role accounts will need a schema change before that role can actually be stored.
 */
export const allowOwnOrganizationStaffManagement = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Authentication is required." });
  }
  if (user.role === "developer") {
    return next();
  }
  if (!["owner", "admin", "manager"].includes(user.role) || !user.organizationId) {
    return res.status(403).json({
      error: "Only developers, organization owners, admins, or managers can manage staff.",
    });
  }

  if (req.body?.role === "developer") {
    return res.status(403).json({
      error: "Only a developer can assign the developer role.",
    });
  }

  try {
    if (req.method === "POST") {
      if (req.body?.organization_id !== user.organizationId) {
        return res.status(403).json({
          error: "You can only add staff to your own organization.",
        });
      }
      return next();
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const result = await db.query(
        "SELECT organization_id FROM users WHERE id = $1",
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Staff member not found." });
      }

      if (result.rows[0].organization_id !== user.organizationId) {
        return res.status(403).json({
          error: "You can only manage staff in your own organization.",
        });
      }

      if (
        req.body?.organization_id &&
        req.body.organization_id !== user.organizationId
      ) {
        return res.status(403).json({
          error: "You cannot move staff to another organization.",
        });
      }

      return next();
    }

    return res.status(403).json({ error: "Staff action is not allowed." });
  } catch (error) {
    return next(error);
  }
};
