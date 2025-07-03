import express from 'express';
import { 
  previewSectionContent,
  createCourseStructureWithContent,
  generateAllContent
} from '../controllers/adminCourseManagement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/courses/preview-content', protect, authorize('admin'), previewSectionContent);
router.post('/courses/:courseId/create-structure', protect, authorize('admin'), createCourseStructureWithContent);
router.post('/courses/:courseId/generate-all-content', protect, authorize('admin'), generateAllContent);

export default router; 