import express from "express";
import { getorganizationsWithShifts } from "../controllers/shiftController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Returns all organizations only to developers, or the caller's own organization.
router.get("/all", authenticateToken, getorganizationsWithShifts);

export default router;
