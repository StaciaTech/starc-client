import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStudyMaterials,
  getStudyMaterial,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  reorderStudyMaterials,
  getAllStudyMaterials
} from '../controllers/studyMaterials.js';

// Router for regular users
const router = express.Router();

// Protected routes for logged-in users
router.get('/course/:courseId', protect, getStudyMaterials);
router.get('/:id', protect, getStudyMaterial);

// Admin only routes
const adminRouter = express.Router();
adminRouter.get('/course/:courseId/all', protect, authorize('admin'), getAllStudyMaterials);
adminRouter.post('/:courseId', protect, authorize('admin'), createStudyMaterial);
adminRouter.put('/:id', protect, authorize('admin'), updateStudyMaterial);
adminRouter.delete('/:id', protect, authorize('admin'), deleteStudyMaterial);
adminRouter.put('/course/:courseId/reorder', protect, authorize('admin'), reorderStudyMaterials);

export default router;
export { adminRouter as adminStudyMaterialRoutes }; 