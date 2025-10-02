import express from 'express';
import { getChatMessages, sendMessage, sseController, getUserRecentMessages } from '../controllers/messageController.js';
import { upload } from '../configs/multer.js';
import { protect } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/sse/:userId', sseController);
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.post('/chat', protect, getChatMessages);
messageRouter.get('/recent', protect, getUserRecentMessages);

export default messageRouter;