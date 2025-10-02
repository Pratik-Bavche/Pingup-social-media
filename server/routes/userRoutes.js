import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getUserData,
    updateUserData,
    discoverUsers,
    followUser,
    unfollowUser,
    sendConnectionRequest,
    getUserConnections,
    acceptConnectionRequest,
    getUserProfiles,
    acceptFollowRequest,
    rejectFollowRequest,
    updateAccountType,
    getUserSuggestions
} from '../controllers/userController.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post(
  '/update',
  protect,
  upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  updateUserData
);
userRouter.post('/update-account-type', protect, updateAccountType);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/send-connection-request', protect, sendConnectionRequest);
userRouter.post('/accept-connection', protect, acceptConnectionRequest);
userRouter.post('/accept-follow-request', protect, acceptFollowRequest);
userRouter.post('/reject-follow-request', protect, rejectFollowRequest);
userRouter.get('/connections', protect, getUserConnections);
userRouter.post('/profiles', protect, getUserProfiles);
userRouter.get('/suggestions', protect, getUserSuggestions); // Added suggestions route

export default userRouter;
