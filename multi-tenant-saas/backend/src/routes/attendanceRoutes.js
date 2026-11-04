import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/roleAccess.middleware.js";
import {
  clockInOwnShift,
  clockOutOwnShift,
  deleteShiftAttendance,
  getAttendance,
  saveShiftAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/all", authenticateToken, getAttendance);
router.post("/shift/:shiftId/clock-in", authenticateToken, requireRoles("staff"), clockInOwnShift);
router.post("/shift/:shiftId/clock-out", authenticateToken, requireRoles("staff"), clockOutOwnShift);
router.delete(
  "/shift/:shiftId",
  authenticateToken,
  requireRoles("developer", "admin", "manager"),
  deleteShiftAttendance,
);
router.put(
  "/shift/:shiftId",
  authenticateToken,
  requireRoles("developer", "admin", "manager"),
  saveShiftAttendance,
);

export default router;
