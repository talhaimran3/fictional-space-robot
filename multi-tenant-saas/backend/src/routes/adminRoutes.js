import express from "express";
import { addCompany } from "../controllers/adminController.js";
const router = express.Router();

router.post("/create-tenant", addCompany);



export default router;
