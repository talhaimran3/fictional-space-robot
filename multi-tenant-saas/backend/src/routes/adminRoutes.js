import express from "express";
import {
  addorganization,
  getAllorganizations,
  getAllShifts,
  getAllUsers,
  editOrganization,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { requireDeveloper } from "../middleware/shiftAccess.middleware.js";

const router = express.Router();

router.post("/create-tenant", authenticateToken, requireDeveloper, addorganization);
router.get("/organizations/all", authenticateToken, getAllorganizations);
router.get("/users/all", authenticateToken, getAllUsers);
router.get("/shifts/all", authenticateToken, getAllShifts);
router.put("/update-tenant/:id", authenticateToken, requireDeveloper, editOrganization);

export default router;
