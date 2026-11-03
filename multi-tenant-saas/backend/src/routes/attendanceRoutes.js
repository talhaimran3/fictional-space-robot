import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/all", authenticateToken, getAttendance);

export default router;
