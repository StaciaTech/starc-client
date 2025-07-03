import express from 'express';
import { sendContactEmail, subscribeToNewsletter } from '../controllers/contactController.js';

const router = express.Router();

// Route for sending contact form emails
router.post('/', sendContactEmail);

// Route for newsletter subscriptions
router.post('/subscribe', subscribeToNewsletter);

export default router; 