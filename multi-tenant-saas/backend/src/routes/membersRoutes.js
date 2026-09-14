import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { resolveTenant } from '../middleware/resolveTenantMidlleware.js';
import { getMembers } from '../controllers/membersController.js';

const router = express.Router();




router.get('/all', authenticateToken, resolveTenant, getMembers)



export default router;