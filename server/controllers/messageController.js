import fs from 'fs';
import imagekit from '../configs/imagekit.js';
import Message from '../models/Message.js';

//create an empty object to story SS event connections
const connections={};

//controller function for sse endpoint
export const sseController=(req,res)=>{
    const {userId}=req.params
    console.log('New client connected : ',userId);

    //set sse headers
    res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Cache-Control','no-cahche');
    res.setHeader('Connection','keep-alive');
    res.setHeader('Access-Control-Allow-Origin','*');
    
    //add teh client response object
    connections[userId]=res

    //send an initial evnt to client
    res.write('log: Connected to SSE stream\n\n');

    //handle client disconnection
    req.on('close',()=>{
        //remove client response object
        delete connections[userId];
        console.log('Client disconnected');               
    })
}

//send message
export const sendMessage=async (req,res) => {
    try {
        const {userId}=req.auth();
        const {to_user_id,text}=req.body;
        const image=req.file;

        let media_url='';
        let media_type=image?'image' :'text';

        if(message_type==='image')
        {
            const fileBuffer=fs.readFileSync(image.path);
            const response= await imagekit.upload({
                file:fileBuffer,
                fileName:image.originalname,
            });

            media_url-imagekit.url({
                path:response.filePath,
                transformation:[
                    {quality:'auto'},
                    {format:'webp'},
                    {width:'1280'},
                ]
            })
        }
        const message=await Message.create({
            from_user_id:userId,
            to_user_id,
            text,
            message_type,
            media_url
        })
        res.json({success:true,message});

        //send message to to_user_id using sse

        const messageWithUserData=await Message.findById(message._id).populate('from_user_id');

        if(connections[to_user_id]){
            connections[to_user_id].write(`data:${JSON.stringify(messageWithUserData)}\n\n`)
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//get chat messages

export const getChatMessages=async (req,res) => {
    try {
        const {userId}=req.auth();
        const {to_user_id,text}=req.body;

        const messages=await Message.find({
            $or:[
                {from_user_id:userId,to_user_id},
                {from_user_id:to_user_id,userId},
            ]
        }).sort({
            createdAt:-1
        })

        await Message.updateMany({
            from_user_id:to_user_id,to_user_id:userId
        },
    {
        seen:true
    })
        res.json({success:true,messages})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getUserRecentMessages=async (req,res) => {
    try {
         const {userId}=req.auth();
        const messages=await Message.find({to_user_id:userId}.populate('from_user_id to_user_id')).sort({createdAt:-1});
        res.json({success:true,messages})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}