import express from "express";
import { getAllorganizations } from "../controllers/adminController.js";
import { getorganizationById } from "../controllers/organizationController.js";
import {
  addShifts,
  deleteShift,
  getShiftById,
  getShifts,
  updateShift,
} from "../controllers/shiftController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  allowOrganizationShiftRead,
  requireDeveloper,
} from "../middleware/shiftAccess.middleware.js";

const router = express.Router();

// Developers see all organizations; other users see only their own organization.
router.get("/all", authenticateToken, getAllorganizations);
router.get("/:id", authenticateToken, allowOrganizationShiftRead, getorganizationById);
router.get("/:id/all-shifts", authenticateToken, allowOrganizationShiftRead, getShifts);
router.get("/:id/all-shifts/:shiftId", authenticateToken, allowOrganizationShiftRead, getShiftById);

// Shift write actions remain developer-only for now.
router.post("/:id/add-shift", authenticateToken, requireDeveloper, addShifts);
router.put("/:id/edit-shift/:shiftId", authenticateToken, requireDeveloper, updateShift);
router.delete("/:id/delete-shift/:shiftId", authenticateToken, requireDeveloper, deleteShift);

export default router;
