import express from "express";
import {
  addCompany,
  getAllCompanies,
  getAllShifts,
  getAllUsers,
} from "../controllers/adminController.js";
import { basicRLS } from "../middleware/rls.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/create-tenant", addCompany);
router.get("/companies/all", authenticateToken, basicRLS, getAllCompanies);
router.get("/users/all", authenticateToken, basicRLS, getAllUsers);
router.get("/shifts/all", authenticateToken, basicRLS, getAllShifts);
export default router;
