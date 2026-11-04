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
  allowOrganizationShiftManage,
  allowOrganizationShiftRead,
} from "../middleware/shiftAccess.middleware.js";
import { requireWorkspaceManagement } from "../middleware/roleAccess.middleware.js";

const router = express.Router();

router.get("/all", authenticateToken, requireWorkspaceManagement, getAllorganizations);
router.get("/:id", authenticateToken, allowOrganizationShiftRead, getorganizationById);
router.get("/:id/all-shifts", authenticateToken, allowOrganizationShiftRead, getShifts);
router.get("/:id/all-shifts/:shiftId", authenticateToken, allowOrganizationShiftRead, getShiftById);

router.post("/:id/add-shift", authenticateToken, allowOrganizationShiftManage, addShifts);
router.put("/:id/edit-shift/:shiftId", authenticateToken, allowOrganizationShiftManage, updateShift);
router.delete("/:id/delete-shift/:shiftId", authenticateToken, allowOrganizationShiftManage, deleteShift);

export default router;
