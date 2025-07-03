import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { 
  getAllUsers, 
  toggleEnrollmentAccess,
  getUserEnrollmentStatus,
  createUser,
  assignCoursesToUser,
  deleteUser
} from '../controllers/adminUserManagement.js';

const router = express.Router();

// Protect all routes
router.use(protect);
// Only allow admin access
router.use(authorize('admin'));

// Routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:userId/toggle-enrollment', toggleEnrollmentAccess);
router.put('/:userId/assign-courses', assignCoursesToUser);
router.get('/:userId/enrollment-status', getUserEnrollmentStatus);
router.delete('/:userId', deleteUser);

export default router; 