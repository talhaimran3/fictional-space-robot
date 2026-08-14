// multi-tenant-saas/backend/src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error("Centralized Error Log:", err);

  // Zod Validation Error (Bad user input before DB)
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation Failed",
      details: err.errors.map((e) => e.message),
    });
  }

  // PostgreSQL Specific Errors
  if (err.code === "23505") {
    return res
      .status(409)
      .json({ error: "Resource already exists (duplicate key)." });
  }

  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced entity does not exist." });
  }

  // Fallback for unexpected bugs
  return res.status(500).json({ error: "Internal server error" });
}
