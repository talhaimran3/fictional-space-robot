import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireOrganizationAccess } from "../middleware/organizationAccess.js";
import {
  getOrganization,getDashboard,getUsers,createUser,updateUser,
  getProjects,createProject,updateProject,getShifts,createShift,updateShift,deleteShift,getTimesheet
} from "../controllers/workspaceController.js";

const router=express.Router();
router.use(authenticateToken);
router.use(requireOrganizationAccess);

router.get("/",getOrganization);
router.get("/dashboard",getDashboard);
router.get("/users",getUsers);
router.post("/users",createUser);
router.put("/users/:id",updateUser);
router.get("/projects",getProjects);
router.post("/projects",createProject);
router.put("/projects/:id",updateProject);
router.get("/shifts",getShifts);
router.post("/shifts",createShift);
router.put("/shifts/:id",updateShift);
router.delete("/shifts/:id",deleteShift);
router.get("/timesheets/monthly",getTimesheet);

export default router;
