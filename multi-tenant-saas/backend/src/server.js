// multi-tenant-saas/backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import shiftRoutes from "./routes/shiftRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import membersRoutes from "./routes/membersRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import developerDatabaseRoutes from "./routes/developerDatabaseRoutes.js";
import cors from "cors";
import db from "./config/database.js";
import { getLocalProfileImageDirectory } from "./utils/localProfileStorage.js";
import { basicRLS } from "./middleware/rls.middleware.js";
dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
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
      if (!origin) return cb(null, true);
      let isCodespacesFrontend = false;
      try {
        const parsedOrigin = new URL(origin);
        isCodespacesFrontend =
          parsedOrigin.protocol === "https:" &&
          /-5173\\.app\\.github\\.dev$/i.test(parsedOrigin.hostname);
      } catch {
        isCodespacesFrontend = false;
      }
      if (frontendUrls.includes(origin) || isCodespacesFrontend) return cb(null, true);
      cb(new Error("CORS policy: origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  "/uploads/profile-images",
  express.static(getLocalProfileImageDirectory(), {
    fallthrough: true,
    index: false,
    dotfiles: "deny",
    maxAge: "7d",
    immutable: true,
  }),
);

app.get("/", async (req, res) => {
  res.json({
    success: true,
    message: "SERVER is RUNNING .....!!!",
  });
});

app.get("/api/health-check", async (req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: { status: "up" },
      postgres: { status: "down", latency_ms: null },
      redis: { status: "down" },
    },
    system: {
      memoryUsage: process.memoryUsage(),
    },
  };

  try {
    const dbStartTime = performance.now();
    const dbResult = await db.query("SELECT NOW();");
    const dbEndTime = performance.now();

    healthCheck.services.postgres.status = "up";
    healthCheck.services.postgres.latency_ms = Math.round(dbEndTime - dbStartTime);
  } catch (dbError) {
    healthCheck.status = "unhealthy";
    healthCheck.services.postgres.status = "down";
    healthCheck.services.postgres.error = dbError.message;
  }

  if (healthCheck.status === "unhealthy") {
    return res.status(503).json(healthCheck);
  }

  return res.status(200).json(healthCheck);
});

app.use("/api/organizations", organizationRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/developer", developerDatabaseRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "The requested API route path does not exist." });
});

app.listen(PORT, () => {
  console.log(`🚀 Server actively listening at http://localhost:${PORT}`);
});
