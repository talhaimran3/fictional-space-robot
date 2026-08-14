import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // Use environment variable for production

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expects "Bearer <TOKEN>"

  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Stores userId and email in request object
    next();
  } catch (err) {
    console.log("Token verification failed:", err);
    res.status(403).json({ error: "Invalid token" });
  }
};
