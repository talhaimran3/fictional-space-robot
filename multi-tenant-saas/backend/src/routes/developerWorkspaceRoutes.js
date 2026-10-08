import express from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getDeveloperDashboard } from "../controllers/workspaceController.js";

const router=express.Router();
router.get("/dashboard",authenticateToken,async(req,res,next)=>{
 if(req.user?.role!=="developer") return res.status(403).json({success:false,message:"Developer access required."});
 next();
},getDeveloperDashboard);
export default router;
