import imagekit from "../configs/imagekit.js";
import { inngest } from "../inngest/index.js";
import Connection from "../models/Connection.js";
import Post from "../models/Post.js";
import User from "../models/User.js"
import fs from 'fs';

//get user data using userId
export const getUserData=async (req,res) => {
    try{
        const {userId}=req.auth()
        const user=await User.findById(userId)
        if(!user)
        {
            return res.json({success:false,message:"User not found"})
        }
        res.json({success:true,user})
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}

//update user data using userId
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });
      if (user) {
        // username already taken, keep old one
        username = tempUser.username;
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name
    };


    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '512' }
        ]
      });
      updatedData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' }
        ]
      });
      updatedData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//find user using username, email, location and name
export const discoverUsers=async (req,res) => {
    try{
        const {userId}=req.auth()
        const {input}=req.body;

        const allUsers=await User.find({
            $or:[
                {
                    username:new RegExp(input,'i')
                },
                 {
                    email:new RegExp(input,'i')
                },
                 {
                    full_name:new RegExp(input,'i')
                },
                 {
                    location:new RegExp(input,'i')
                },
            ]
        })
        const filteredUsers=allUsers.filter(user=>user._id!==userId);
        res.json({success:true,users:filteredUsers})
    }
    catch(error){
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


//follow users
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        if (userId === id) {
            return res.json({ success: false, message: 'You cannot follow yourself' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.json({ success: false, message: 'Target user not found' });
        }

        // Check if already following
        if (user.following.includes(id)) {
            return res.json({ success: false, message: 'You are already following this user' });
        }

        // Check if already in pending followers
        if (targetUser.pending_followers.includes(userId)) {
            return res.json({ success: false, message: 'Follow request already pending' });
        }

        if (targetUser.account_type === 'public') {
            // Public account - follow immediately
            user.following.push(id);
            targetUser.followers.push(userId);
            
            await user.save();
            await targetUser.save();

            res.json({ success: true, message: 'Now you are following this user', immediate: true });
        } else {
            // Private account - send follow request
            targetUser.pending_followers.push(userId);
            await targetUser.save();

            res.json({ success: true, message: 'Follow request sent. Waiting for approval.', immediate: false });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Remove from following
        user.following = user.following.filter(followingId => followingId !== id);
        await user.save();

        // Remove from target user's followers
        const toUser = await User.findById(id);
        if (toUser) {
            toUser.followers = toUser.followers.filter(followerId => followerId !== userId);
            await toUser.save();
        }

        res.json({ success: true, message: 'You are no longer following this user' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


//Send Connection Request

export const sendConnectionRequest=async (req,res) => {
    try{
        const{userId}=req.auth();
        const {id}=req.body;

        //20 connection req in 24hrs

        const last24Hours=new Date(Date.now()-24*60*60*1000);
        const connectionRequests=await Connection.find({from_user_id:userId,createdAt:{$gt:last24Hours}});
        if(connectionRequests.length>=20){
            return res.json({success:false,message:'You have sent more than 20 connection requests in last 24 hours'});
        }
        //Check if user already connected
        const connection=await Connection.findOne({
            $or:[
                {from_user_id:userId,to_user_id:id},
                {from_user_id:id,to_user_id:userId},
            ]
        })

        if(!connection)
        {
            const newConnection=await Connection.create({
                from_user_id:userId,
                to_user_id:id
            })


            await inngest.send({
                name:'app/connection-request',
                data:{connectionId:newConnection._id}
            })

           res.json({success:true,message:'Connection request sent successfully'});
        }
        else if(connection &&  connection.status==='accepted')
        {
            res.json({success:false,message:'You are already connected to this user'});
        }

        return res.json({success:false,message:'Connection request pending'});

    }
    catch(error)
    {
        console.log(error);
        res.json({success:false,message:error.message})
    }
} 


//user connections
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const connections = user.connections || [];
        const followers = user.followers || [];
        const following = user.following || [];
        const pendingFollowers = user.pending_followers || []; // Added pending followers

        // Get pending connections without populate to avoid casting issues
        const pendingConnectionsData = await Connection.find({ to_user_id: userId, status: 'pending' });
        
        // Manually populate user data to avoid casting issues
        const pendingConnections = await Promise.all(
            pendingConnectionsData.map(async (connection) => {
                try {
                    const userData = await User.findById(connection.from_user_id);
                    return userData || { _id: connection.from_user_id, full_name: 'Unknown User', username: 'unknown' };
                } catch (error) {
                    console.error('Error populating user for pending connection:', error);
                    return { _id: connection.from_user_id, full_name: 'Unknown User', username: 'unknown' };
                }
            })
        );

        // Populate pending followers data
        const populatedPendingFollowers = await Promise.all(
            pendingFollowers.map(async (followerId) => {
                try {
                    const userData = await User.findById(followerId);
                    return userData || { _id: followerId, full_name: 'Unknown User', username: 'unknown' };
                } catch (error) {
                    console.error('Error populating pending follower:', error);
                    return { _id: followerId, full_name: 'Unknown User', username: 'unknown' };
                }
            })
        );

        res.json({ 
            success: true, 
            connections, 
            followers, 
            following, 
            pendingConnections,
            pendingFollowers: populatedPendingFollowers // Added populated pending followers
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
} 


//accept connctions request

export const acceptConnectionRequest=async (req,res) => {
    try{
        const{userId}=req.auth();
        const{id}=req.body;
        
        const connection=await Connection.findOne({from_user_id:id,to_user_id:userId})

        if(!connection)
        {
            return res.json({success:false,message:'Connection not found'});
        }

        const user=await User.findById(userId);
        user.connections.push(id);
        await user.save()

        const toUser=await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save()

        connection.status='accepted';
        await connection.save();

        res.json({success:true,message:'Connection accept successfully'});
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false,message:error.message})
    }
} 


//Get user profiles
export const getUserProfiles = async (req, res) => {
    try {
        const { profileId } = req.body;
        const profile = await User.findById(profileId);
        if (!profile) {
            return res.json({ success: false, message: "Profile not found" });
        }
        
        // Get posts without populate to avoid casting issues
        const posts = await Post.find({ user: profileId }).sort({ createdAt: -1 });
        
        // Manually add user data to posts
        const postsWithUser = posts.map(post => ({
            ...post.toObject(),
            user: profile
        }));

        res.json({ success: true, profile, posts: postsWithUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//accept follow request (for private accounts)
export const acceptFollowRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { followerId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if the follower is in pending_followers
        if (!user.pending_followers.includes(followerId)) {
            return res.json({ success: false, message: 'No pending follow request from this user' });
        }

        // Remove from pending followers
        user.pending_followers = user.pending_followers.filter(id => id !== followerId);
        
        // Add to followers
        user.followers.push(followerId);
        
        // Add to connections (mutual connection)
        if (!user.connections.includes(followerId)) {
            user.connections.push(followerId);
        }

        await user.save();

        // Update the follower's following list and connections
        const follower = await User.findById(followerId);
        if (follower) {
            follower.following.push(userId);
            if (!follower.connections.includes(userId)) {
                follower.connections.push(userId);
            }
            await follower.save();
        }

        res.json({ success: true, message: 'Follow request accepted successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//reject follow request (for private accounts)
export const rejectFollowRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { followerId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Remove from pending followers
        user.pending_followers = user.pending_followers.filter(id => id !== followerId);
        await user.save();

        res.json({ success: true, message: 'Follow request rejected successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//update account type (public/private)
export const updateAccountType = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { account_type } = req.body;

        if (!['public', 'private'].includes(account_type)) {
            return res.json({ success: false, message: 'Invalid account type. Must be "public" or "private"' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        user.account_type = account_type;
        await user.save();

        res.json({ success: true, message: `Account changed to ${account_type}`, user });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//get user suggestions for feed sidebar
export const getUserSuggestions = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Get users that the current user is not following and not connected to
        const excludedUserIds = [
            userId,
            ...(user.following || []),
            ...(user.connections || []),
            ...(user.pending_followers || [])
        ];

        // Find users to suggest (excluding current user's network)
        const suggestions = await User.find({
            _id: { $nin: excludedUserIds }
        })
        .limit(5) // Limit to 5 suggestions
        .select('_id full_name username profile_picture bio account_type followers');

        res.json({ success: true, suggestions });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}