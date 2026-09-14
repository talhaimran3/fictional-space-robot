// controllers/memberController.js

import db from "../config/database.js";

export const getMembers = async (req, res) => {
  const organizationId = req.organization.id;

  const { rows } = await db.query(
    `
      SELECT
        u.id,
        u.name,
        u.email,
        om.role,
        om.created_at
      FROM organization_members om

      INNER JOIN users u
        ON u.id = om.user_id

      WHERE om.organization_id = $1

      ORDER BY u.name ASC
    `,
    [organizationId]
  );

  res.json({
    success: true,
    members: rows,
  });
};