import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireRoles } from "../middleware/roleAccess.middleware.js";
import { allowOwnOrganizationStaffManagement } from "../middleware/shiftAccess.middleware.js";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  getMyProfile,
  updateEmployee,
  updateMyProfile,
  uploadProfilePicture,
} from "../controllers/employeeController.js";

const router = express.Router();

router.get("/me", authenticateToken, getMyProfile);
router.put("/me", authenticateToken, updateMyProfile);
router.put(
  "/me/profile-picture",
  authenticateToken,
  express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }),
  uploadProfilePicture,
);

router.get("/all", authenticateToken, requireRoles("developer", "admin", "manager"), getAllEmployees);
router.post("/create", authenticateToken, allowOwnOrganizationStaffManagement, addEmployee);
router.put("/update/:id", authenticateToken, allowOwnOrganizationStaffManagement, updateEmployee);
router.delete("/delete/:id", authenticateToken, allowOwnOrganizationStaffManagement, deleteEmployee);

export default router;
