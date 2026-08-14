// multi-tenant-saas/backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import shiftRoutes from "./routes/shiftRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import db from "./config/database.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Support a comma-separated list of allowed frontend URLs via FRONTEND_URLS,
// or a single FRONTEND_URL for simple setups. Defaults to local Vite port.
const frontendUrls = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://127.0.0.1:5173"
)
  .split(",")
  .map((u) => u.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (curl, server-to-server) when no origin is set
      if (!origin) return cb(null, true);
      if (frontendUrls.includes(origin)) return cb(null, true);
      cb(new Error("CORS policy: origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  }),
);

app.use(express.json());

// Base Route
app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "SERVER is RUNNING .....!!!",
  });
});

// Health Route
app.get("/health", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    console.log(result);
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
// Main ROUTES
app.use("/api/companies", companyRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
// Global 404 Fallback Handler
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "The requested API route path does not exist." });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server actively listening at http://localhost:${PORT}`);
});
