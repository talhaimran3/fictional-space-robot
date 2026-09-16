import db from "../config/database.js";

export const getMembers = async (req, res) => {
  // Prefer the authenticated organization from middleware
  const organizationId = req.organization?.id || req.params.organizationId;

  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: "Organization ID is required.",
    });
  }

  try {
    const { rows } = await db.query(
      `
      SELECT
        id,
        full_name AS name,
        email,
        role,
        created_at
      FROM users
      WHERE organization_id = $1
      ORDER BY full_name ASC
      `,
      [organizationId]
    );

    res.json({
      success: true,
      members: rows,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch members.",
    });
  }
};