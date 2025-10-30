import express from 'express';
import { loginUser, registerUser, logoutUser, refreshUserToken, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authorization.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser); // il body deve contenere { userId }
router.post('/refresh-token', refreshUserToken);
router.get('/profile', verifyToken, getUserProfile); // protezione JWT

export default router;
