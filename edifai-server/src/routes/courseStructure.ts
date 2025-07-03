import express from 'express';
import { 
  createCourseStructure,
  getCourseStructure,
  updateCourseStructure,
  addChapter,
  addSubchapter,
  addSection,
  generateSectionContent,
  deleteChapter,
  updateSectionVideoUrl
} from '../controllers/courseStructure.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Base routes for course structure
router.route('/')
  .post(protect, authorize('admin'), createCourseStructure)
  .get(protect, getCourseStructure)
  .put(protect, authorize('admin'), updateCourseStructure);

// Chapter routes
router.route('/chapters')
  .post(protect, authorize('admin'), addChapter);

// Chapter delete route
router.route('/chapters/:chapterId')
  .delete(protect, authorize('admin'), deleteChapter);

// Subchapter routes
router.route('/chapters/:chapterId/subchapters')
  .post(protect, authorize('admin'), addSubchapter);

// Section routes
router.route('/chapters/:chapterId/subchapters/:subchapterId/sections')
  .post(protect, authorize('admin'), addSection);

// Content generation route
router.route('/chapters/:chapterId/subchapters/:subchapterId/sections/:sectionId/generate')
  .post(protect, generateSectionContent);

// Section video URL update route
router.route('/section/:sectionId/video')
  .patch(protect, authorize('admin'), updateSectionVideoUrl);

export default router; 