//multi-tenant-saas/backend/src/routes/shiftRoutes.js
import Router from "express";
import { resolveTenant } from "../middleware/resolveTenantMidlleware.js";
import { addShifts, getCompaniesWithShifts, getShifts } from "../controllers/shiftController.js";

const router = Router();

// Apply the tenant protection middleware specifically to these routes
router.get("/", resolveTenant, getShifts);
router.get("/all", getCompaniesWithShifts);

export default router;
