import jwt from "jsonwebtoken";
import db from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const claims = jwt.verify(token, JWT_SECRET);
    const userId = claims.userId || claims.id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.organization_id, u.status,
              o.status AS organization_status
       FROM users u
       LEFT JOIN organizations o ON o.id = u.organization_id
       WHERE u.id = $1
       LIMIT 1`,
      [userId],
    );

    if (!result.rows.length || result.rows[0].status === "inactive") {
      return res.status(401).json({ error: "This account is not active." });
    }

    const currentUser = result.rows[0];
    if (currentUser.organization_id && currentUser.organization_status !== "active") {
      return res.status(403).json({ error: "Your organization is inactive. Contact your platform administrator." });
    }

    req.user = {
      ...claims,
      id: currentUser.id,
      userId: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.full_name,
      role: currentUser.role,
      organizationId: currentUser.organization_id,
      status: currentUser.status,
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    console.error("Authentication lookup failed:", error);
    return res.status(500).json({ error: "Unable to authenticate this request." });
  }
};
