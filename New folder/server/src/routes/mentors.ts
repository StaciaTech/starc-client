import express from 'express';
import { getMentors, getMentor, getMentorCourses } from '../controllers/mentors.js';

const router = express.Router();

// Mentor routes
router.get('/', getMentors);
router.get('/:id', getMentor);
router.get('/:id/courses', getMentorCourses);

export default router; 