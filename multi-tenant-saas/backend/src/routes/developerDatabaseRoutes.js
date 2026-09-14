// fictional-space-robot/multi-tenant-saas/backend/src/routes/developerDatabaseRoutes.js
import express from "express";
import { getDatabaseSchema, getSingleTableData, getTableData } from "../controllers/developerDatabaseController.js";
const router = express.Router();




router.get('/database/table-data', getTableData)
router.get('/database/schema', getDatabaseSchema)
router.get('/database/table-data/:tableName', getSingleTableData)




export default router;