import express from 'express';
import { register, login, getMe } from '../controllers/auth.js';
import { updateProfile } from '../controllers/profile.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router; 