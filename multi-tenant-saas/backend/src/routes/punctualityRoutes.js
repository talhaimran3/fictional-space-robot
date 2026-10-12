import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getTodayPunctuality } from "../controllers/punctualityController.js";

const router = express.Router();

router.get("/today", authenticateToken, getTodayPunctuality);

export default router;
