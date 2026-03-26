import express from 'express';
import { sendContactNotification } from '../services/emailService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, inquiryType, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    await sendContactNotification({ name, email, inquiryType, message });

    res.status(200).json({ message: 'Message received successfully!' });

  } catch (error) {
    console.error('Error in /api/contact route:', error.message);
    res.status(500).json({ message: 'Internal server error. Could not send message.' });
  }
});

export default router;
