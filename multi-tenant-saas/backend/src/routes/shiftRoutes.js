import express from "express";
import { getorganizationsWithShifts } from "../controllers/shiftController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireWorkspaceManagement } from "../middleware/roleAccess.middleware.js";

const router = express.Router();

router.get("/all", authenticateToken, requireWorkspaceManagement, getorganizationsWithShifts);

export default router;
