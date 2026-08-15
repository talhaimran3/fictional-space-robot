// multi-tenant-saas/backend/src/middleware/rls.middleware.js
import db from "../config/database.js";
export const basicRLS = async (req, res, next) => {
  // check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  try {
    //  Start a database transaction
    await db.query("BEGIN");

    await db.query(`SELECT set_config('app.current_role', $1, true);`, [
      req.user.platform_role,
    ]);
    // await db.query(`SELECT set_config('app.current_user_id', $1, true);`, [String(req.user.id)]);
    // 5. Attach this secure connection to the request object
    req.dbClient = db;

    // 6. Keep moving to your actual route code
    next();
  } catch (error) {
    console.log("RLS middleware error:", error);
    return res.status(500).json({ error: "Database security setup failed." });
  }
};
