import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { allowOwnOrganizationStaffManagement } from "../middleware/shiftAccess.middleware.js";
import {
  addEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/all", authenticateToken, getAllEmployees);
router.post("/create", authenticateToken, allowOwnOrganizationStaffManagement, addEmployee);
router.put("/update/:id", authenticateToken, allowOwnOrganizationStaffManagement, updateEmployee);
router.delete("/delete/:id", authenticateToken, allowOwnOrganizationStaffManagement, deleteEmployee);

export default router;
