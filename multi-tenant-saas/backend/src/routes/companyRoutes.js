//multi-tenant-saas/backend/src/routes/companyRoutes.js
import Router from "express";
import { resolveTenant } from "../middleware/resolveTenantMidlleware.js";
import {
  getAllCompanies,
  getCompanyById,
} from "../controllers/companyController.js";
import { addShifts, deleteShift, getShiftById, getShifts, updateShift } from "../controllers/shiftController.js";

const router = Router();

// Apply the tenant protection middleware specifically to these routes
// router.use(resolveTenant);
router.get("/all", getAllCompanies);

router.get("/:id", getCompanyById);
router.get("/:id/all-shifts", getShifts);

router.post("/:id/add-shift", addShifts);
router.get("/:id/all-shifts/:shiftId", getShiftById);
router.put("/:id/edit-shift/:shiftId", updateShift);
router.delete("/:id/delete-shift/:shiftId",deleteShift);

export default router;
