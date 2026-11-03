import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  getAttendance,
  saveShiftAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/all", authenticateToken, getAttendance);
router.put("/shift/:shiftId", authenticateToken, saveShiftAttendance);

export default router;
