import express from 'express';
import { 
  getCourseStructure, 
  createCourseStructure, 
  updateCourseStructure,
  updateSectionContent,
  updateSectionVideoUrl
} from '../controllers/courseStructure.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Basic structure routes
router.get('/', getCourseStructure);
router.post('/', protect, authorize('admin'), createCourseStructure);
router.put('/', protect, authorize('admin'), updateCourseStructure);

// Section content routes
router.patch('/section/:sectionId/content', protect, authorize('admin'), updateSectionContent);

// Add the new route for updating section video URL
router.patch('/section/:sectionId/video', protect, authorize('admin'), updateSectionVideoUrl);

export default router; 