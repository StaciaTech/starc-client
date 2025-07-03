import express from 'express';
import { 
  getUserSchedule, 
  addScheduleEvent, 
  updateScheduleEvent, 
  deleteScheduleEvent 
} from '../controllers/schedule.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Schedule routes
router.route('/')
  .get(getUserSchedule)
  .post(addScheduleEvent);

router.route('/:id')
  .put(updateScheduleEvent)
  .delete(deleteScheduleEvent);

export default router; 