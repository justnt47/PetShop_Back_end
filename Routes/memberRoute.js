import express from 'express';
import * as mem from '../Controllers/memberController.js';

const router = express.Router();


// // NOTE: member routes
router.post('/members', mem.addMember);
router.post('/members/login', mem.loginMember);
router.get('/members/logout', mem.logoutMember);
router.post('/members/updatePassword', mem.updatePassword);
router.post('/members/updateUser', mem.updateUser);
export default router;