import Router from "express";
import { getAllorganizations, getorganizationById } from "../controllers/organizationController.js";
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

const router = Router();

router.get("/all", authenticateToken, getAllorganizations);
router.get("/:id", authenticateToken, allowOrganizationShiftRead, getorganizationById);
router.get("/:id/all-shifts", authenticateToken, allowOrganizationShiftRead, getShifts);
router.post("/:id/add-shift", authenticateToken, requireDeveloper, addShifts);
router.get("/:id/all-shifts/:shiftId", authenticateToken, allowOrganizationShiftRead, getShiftById);
router.put("/:id/edit-shift/:shiftId", authenticateToken, requireDeveloper, updateShift);
router.delete("/:id/delete-shift/:shiftId", authenticateToken, requireDeveloper, deleteShift);

export default router;
