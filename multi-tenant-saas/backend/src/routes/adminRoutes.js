import express from "express";
import {
  addorganization,
  getAllorganizations,
  getAllShifts,
  getAllUsers,
  editOrganization
} from "../controllers/adminController.js";
import { basicRLS } from "../middleware/rls.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create-tenant", addorganization);
router.get("/organizations/all", authenticateToken, basicRLS, getAllorganizations);
router.get("/users/all", authenticateToken, basicRLS, getAllUsers);
router.get("/shifts/all", authenticateToken, basicRLS, getAllShifts);
router.put("/update-tenant/:id", authenticateToken, basicRLS, editOrganization);
export default router;
