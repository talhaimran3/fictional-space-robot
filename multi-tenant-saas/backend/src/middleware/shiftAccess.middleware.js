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
