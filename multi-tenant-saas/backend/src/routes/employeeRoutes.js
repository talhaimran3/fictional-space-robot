import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireDeveloper } from "../middleware/shiftAccess.middleware.js";
import {
  addEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/all", authenticateToken, getAllEmployees);
router.post("/create", authenticateToken, requireDeveloper, addEmployee);
router.put("/update/:id", authenticateToken, requireDeveloper, updateEmployee);
router.delete("/delete/:id", authenticateToken, requireDeveloper, deleteEmployee);

export default router;
