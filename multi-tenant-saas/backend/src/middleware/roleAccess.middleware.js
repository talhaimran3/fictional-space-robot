const MANAGEMENT_ROLES = ["developer", "admin", "manager"];

export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication is required." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have permission to perform this action." });
  }
  return next();
};

export const requireWorkspaceManagement = requireRoles(...MANAGEMENT_ROLES);
