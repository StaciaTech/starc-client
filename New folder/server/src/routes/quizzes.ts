import express from 'express';
import { 
  getQuizById,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttemptById,
  getUserQuizAttemptsByQuiz
} from '../controllers/quiz.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

// Routes for /api/quizzes
router.route('/:id')
  .get(getQuizById)
  .put(authorize('admin'), updateQuiz)
  .delete(authorize('admin'), deleteQuiz);

// Quiz attempt submission
router.route('/:id/submit')
  .post(submitQuizAttempt);

// Quiz attempts for a specific quiz
router.route('/:id/attempts')
  .get(getUserQuizAttemptsByQuiz);

// Quiz attempt details
router.route('/attempts/:id')
  .get(getQuizAttemptById);

export default router;