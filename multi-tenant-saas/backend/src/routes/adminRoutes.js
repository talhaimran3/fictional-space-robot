import express from "express";
import {
  addorganization,
  getAllorganizations,
  getAllShifts,
  getAllUsers,
  editOrganization,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRoles, requireWorkspaceManagement } from "../middleware/roleAccess.middleware.js";

const router = express.Router();

router.post("/create-tenant", authenticateToken, requireRoles("developer"), addorganization);
router.get("/organizations/all", authenticateToken, requireWorkspaceManagement, getAllorganizations);
router.get("/users/all", authenticateToken, requireWorkspaceManagement, getAllUsers);
router.get("/shifts/all", authenticateToken, requireWorkspaceManagement, getAllShifts);
router.put("/update-tenant/:id", authenticateToken, requireRoles("developer"), editOrganization);

export default router;
