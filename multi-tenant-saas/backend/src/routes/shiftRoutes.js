import express from "express";
import { resolveTenant } from "../middleware/resolveTenantMidlleware.js";
import { getorganizationsWithShifts, getShifts } from "../controllers/shiftController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateToken, resolveTenant, getShifts);
router.get("/all", authenticateToken, getorganizationsWithShifts);

export default router;
