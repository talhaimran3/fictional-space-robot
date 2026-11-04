import db from "../config/database.js";

const MANAGEMENT_ROLES = ["developer", "admin", "manager"];
const ASSIGNABLE_ROLES = ["staff", "manager", "admin", "developer"];

const hasOrganizationAccess = (user, organizationId) =>
  user?.role === "developer" ||
  (MANAGEMENT_ROLES.includes(user?.role) &&
    Boolean(user?.organizationId) &&
    user.organizationId === organizationId);

export const allowOrganizationShiftRead = (req, res, next) => {
  if (hasOrganizationAccess(req.user, req.params.id)) {
    return next();
  }
  return res.status(403).json({
    error: "You do not have access to this organization's staff or shifts.",
  });
};

export const allowOrganizationShiftManage = (req, res, next) => {
  if (hasOrganizationAccess(req.user, req.params.id)) {
    return next();
  }
  return res.status(403).json({
    error: "Only developers, admins, or managers in this organization can manage its shifts.",
  });
};

/**
 * Admins and managers can manage user accounts only inside their own
 * organization. They may assign staff, manager, or admin roles as requested.
 * Only developers may create or assign developer accounts.
 */
export const allowOwnOrganizationStaffManagement = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Authentication is required." });
  }
  if (!MANAGEMENT_ROLES.includes(user.role)) {
    return res.status(403).json({ error: "You do not have permission to manage staff." });
  }

  const requestedRole = req.body?.role;
  if (requestedRole && !ASSIGNABLE_ROLES.includes(requestedRole)) {
    return res.status(400).json({ error: "Invalid user role." });
  }
  if (user.role !== "developer" && requestedRole === "developer") {
    return res.status(403).json({ error: "Only developers can assign the developer role." });
  }

  try {
    if (req.method === "POST") {
      const organizationId = req.body?.organization_id;
      if (user.role !== "developer" && organizationId !== user.organizationId) {
        return res.status(403).json({ error: "You can only add users to your own organization." });
      }
      return next();
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const result = await db.query(
        "SELECT organization_id, role FROM users WHERE id = $1",
        [req.params.id],
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: "Staff member not found." });
      }

      const target = result.rows[0];
      if (user.role !== "developer") {
        if (target.organization_id !== user.organizationId) {
          return res.status(403).json({ error: "You can only manage users in your own organization." });
        }
        if (target.role === "developer") {
          return res.status(403).json({ error: "You cannot manage a developer account." });
        }
        if (
          req.body?.organization_id &&
          req.body.organization_id !== user.organizationId
        ) {
          return res.status(403).json({ error: "You cannot move users to another organization." });
        }
      }
      return next();
    }

    return res.status(403).json({ error: "This staff action is not allowed." });
  } catch (error) {
    return next(error);
  }
};
