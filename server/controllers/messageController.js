import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Message from '../models/Message.js';
import User from '../models/User.js'; // Added import for User model

//create an empty object to store SSE event connections
const connections = {};

//controller function for sse endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New client connected : ', userId);

    //set sse headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //add the client response object
    connections[userId] = res;

    //send an initial event to client
    res.write('data: Connected to SSE stream\n\n');

    //handle client disconnection
    req.on('close', () => {
        //remove client response object
        delete connections[userId];
        console.log('Client disconnected');
    });
};

//send message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if (message_type === 'image') {
            if (!image) {
                return res.json({ success: false, message: 'Image file is required' });
            }

            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname,
                folder: "messages",
            });

            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' },
                ]
            });
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        });

        res.json({ success: true, message });

        //send message to to_user_id using sse
        try {
            const userData = await User.findById(userId);
            const messageWithUserData = {
                ...message.toObject(),
                from_user_id: userData || { _id: userId, full_name: 'Unknown User', username: 'unknown' }
            };

            if (connections[to_user_id]) {
                connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
            }
        } catch (error) {
            console.error('Error populating user data for SSE:', error);
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//get chat messages
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ]
        }).sort({
            createdAt: -1
        });

        // Mark messages as seen
        await Message.updateMany({
            from_user_id: to_user_id,
            to_user_id: userId
        }, {
            seen: true
        });

        // Manually populate user data to avoid casting issues
        const populatedMessages = await Promise.all(
            messages.map(async (message) => {
                try {
                    const fromUser = await User.findById(message.from_user_id);
                    const toUser = await User.findById(message.to_user_id);
                    return {
                        ...message.toObject(),
                        from_user_id: fromUser || { _id: message.from_user_id, full_name: 'Unknown User', username: 'unknown' },
                        to_user_id: toUser || { _id: message.to_user_id, full_name: 'Unknown User', username: 'unknown' }
                    };
                } catch (error) {
                    console.error('Error populating user data for message:', message._id, error);
                    return {
                        ...message.toObject(),
                        from_user_id: { _id: message.from_user_id, full_name: 'Unknown User', username: 'unknown' },
                        to_user_id: { _id: message.to_user_id, full_name: 'Unknown User', username: 'unknown' }
                    };
                }
            })
        );

        res.json({ success: true, messages: populatedMessages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const messages = await Message.find({ to_user_id: userId }).sort({ createdAt: -1 });
        
        // Manually populate user data to avoid casting issues
        const populatedMessages = await Promise.all(
            messages.map(async (message) => {
                try {
                    const fromUser = await User.findById(message.from_user_id);
                    const toUser = await User.findById(message.to_user_id);
                    return {
                        ...message.toObject(),
                        from_user_id: fromUser || { _id: message.from_user_id, full_name: 'Unknown User', username: 'unknown' },
                        to_user_id: toUser || { _id: message.to_user_id, full_name: 'Unknown User', username: 'unknown' }
                    };
                } catch (error) {
                    console.error('Error populating user data for recent message:', message._id, error);
                    return {
                        ...message.toObject(),
                        from_user_id: { _id: message.from_user_id, full_name: 'Unknown User', username: 'unknown' },
                        to_user_id: { _id: message.to_user_id, full_name: 'Unknown User', username: 'unknown' }
                    };
                }
            })
        );
        
        res.json({ success: true, messages: populatedMessages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};