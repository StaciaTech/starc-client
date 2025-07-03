import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAssignments,
  getAssignment,
  submitAssignment,
  getUserSubmissions,
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  reorderAssignments,
  getAllSubmissions,
  provideSubmissionFeedback
} from '../controllers/assignments.js';

// Router for regular users
const router = express.Router();

// Protect all routes - require authentication
router.use(protect);

// Routes for authenticated users
router.get('/course/:courseId', getAssignments);
router.get('/:id', getAssignment);
router.post('/:id/submit', submitAssignment);
router.get('/:id/submissions', getUserSubmissions);

// Admin router
const adminRouter = express.Router();

// Protect all admin routes and require admin role
adminRouter.use(protect);
adminRouter.use(authorize('admin'));

// Admin routes
adminRouter.get('/course/:courseId', getAllAssignments);
adminRouter.post('/course/:courseId', createAssignment);
adminRouter.put('/:id', updateAssignment);
adminRouter.delete('/:id', deleteAssignment);
adminRouter.put('/course/:courseId/reorder', reorderAssignments);
adminRouter.get('/:id/submissions', getAllSubmissions);
adminRouter.put('/submissions/:id', provideSubmissionFeedback);

export { router, adminRouter }; 