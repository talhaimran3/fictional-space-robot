// multi-tenant-saas/backend/src/server.js
import express from "express";
import dotenv from "dotenv";
import shiftRoutes from "./routes/shiftRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import db from "./config/database.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import { basicRLS } from "./middleware/rls.middleware.js";
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
// import { Redis } from 'ioredis'; // or 'redis' depending on your package
// import { db } from './db'; // Your existing database module

// Initialize your redis client instance somewhere accessible
// const redis = new Redis(process.env.REDIS_URL); 

app.get("/api/health-check", async (req, res) => {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Node.js process uptime in seconds
    services: {
      api: { status: "up" },
      postgres: { status: "down", latency_ms: null },
      redis: { status: "down" },
    },
    system: {
      memoryUsage: process.memoryUsage(),
    }
  };

  try {
    // 1. Test PostgreSQL Connection & Calculate Latency
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

  // try {
  //   // 2. Test Redis Cluster/Server Connection using PING
  //   const redisStatus = await redis.ping();
  //   if (redisStatus === "PONG") {
  //     healthCheck.services.redis.status = "up";
  //   } else {
  //     throw new Error("Redis did not return PONG");
  //   }
  // } catch (redisError) {
  //   healthCheck.status = "unhealthy";
  //   healthCheck.services.redis.status = "down";
  //   healthCheck.services.redis.error = redisError.message;
  // }

  // 3. Return correct HTTP status codes depending on dependencies
  if (healthCheck.status === "unhealthy") {
    // 503 Service Unavailable allows load balancers (AWS ELB/Nginx) to know the app is failing
    return res.status(503).json(healthCheck);
  }

  return res.status(200).json(healthCheck);
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
