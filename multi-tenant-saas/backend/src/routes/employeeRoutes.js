import express from 'express';
import { basicRLS } from "../middleware/rls.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { addEmployee, getAllEmployees,updateEmployee, deleteEmployee} from '../controllers/employeeController.js';



const router = express.Router();



router.get('/all',authenticateToken, basicRLS, getAllEmployees)
router.post('/create', authenticateToken, basicRLS, addEmployee)
router.put('/update/:id', authenticateToken, basicRLS, updateEmployee)
router.delete('/delete/:id', authenticateToken, basicRLS, deleteEmployee)


export default router;