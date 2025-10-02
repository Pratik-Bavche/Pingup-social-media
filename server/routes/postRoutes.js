import express from 'express';
import { protect } from '../middleware/auth.js';
import { addPost, getFeedPost, likePost, addComment, deletePost, getComments } from '../controllers/postController.js';
import { upload } from '../configs/multer.js';

const postRouter = express.Router();

postRouter.post('/add', protect, upload.array('images', 5), addPost);
postRouter.get('/feed', protect, getFeedPost);
postRouter.post('/like', protect, likePost);
postRouter.post('/comment', protect, addComment); // Added comment route
postRouter.delete('/delete', protect, deletePost); // Added delete route
postRouter.get('/comments/:postId', protect, getComments); // Added get comments route

export default postRouter;