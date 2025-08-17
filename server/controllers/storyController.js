import fs from 'fs'
import imagekit from '../configs/imagekit.js';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { inngest } from '../inngest/index.js';

//Add user story

export const addUserStory=async (req,res) => {
    try {
        const {userId}=req.auth();
        const {content,media_type,background_color}=req.body;
        const media=req.file;
        let media_url='';

        //upload meadia to imagekit

        if(media_type==='image' || media_type==='video')
        {
            const fileBuffer=fs.readFileSync(media.path)
            const response=await imagekit.upload({
                file:fileBuffer,
                fileName:media.originalname,
            })
            media_url=response.url
        }
        //create story

        const story=await Story.create(
            {
                user:userId,
                content,
                media_url,
                media_type,
                background_color
            }  
        )

        //schedule story deletion after 24hrs
        await inngest.send({
            name:'app/story.delete',
            data:{storyId:story._id}
        })

        res.json({success:true})

    } catch (error) {
            console.log(error);
        res.json({success:false,message:error.message})
    }
}

//get user story
export const getStories=async (req,res) => {
    try {

        const {userId}=req.auth();
        const user=await User.findById(userId)

        //user connections and followings
        const userIds=[userId,...User.connections,...user.following]
        const stories=await Story.find({
            user:{$in:userIds}
        }).populate('user').sort({createdAt:-1});

        res.json({success:true})
        
    } catch (error) {
            console.log(error);
        res.json({success:false,message:error.message})
    }
}