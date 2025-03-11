import express from 'express';
import * as mem from '../Controllers/memberController.js';

const router = express.Router();


// // NOTE: member routes
router.post('/members', mem.addMember);
router.post('/members/login', mem.loginMember);
export default router;