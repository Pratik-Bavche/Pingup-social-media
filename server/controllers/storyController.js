import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { inngest } from '../inngest/index.js';

//Add user story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file;
        let media_url = '';

        //upload media to imagekit
        if (media_type === 'image' || media_type === 'video') {
            if (!media) {
                return res.json({ success: false, message: 'Media file is required for image/video stories' });
            }
            
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname,
                folder: "stories",
            });
            media_url = response.url;
        }

        //create story
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color: background_color || '#4f46e5'
        });

        //schedule story deletion after 24hrs
        await inngest.send({
            name: 'app/story.delete',
            data: { storyId: story._id }
        });

        res.json({ success: true, message: 'Story created successfully', story });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//get user stories
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        //user connections and followings
        const userIds = [userId, ...(user.connections || []), ...(user.following || [])];
        
        // Get stories without populate to avoid casting issues
        const stories = await Story.find({
            user: { $in: userIds }
        }).sort({ createdAt: -1 });

        // Manually populate user data to avoid casting issues
        const populatedStories = await Promise.all(
            stories.map(async (story) => {
                try {
                    const userData = await User.findById(story.user);
                    return {
                        ...story.toObject(),
                        user: userData || { _id: story.user, full_name: 'Unknown User', username: 'unknown' }
                    };
                } catch (error) {
                    console.error('Error populating user for story:', story._id, error);
                    return {
                        ...story.toObject(),
                        user: { _id: story.user, full_name: 'Unknown User', username: 'unknown' }
                    };
                }
            })
        );

        res.json({ success: true, stories: populatedStories });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}