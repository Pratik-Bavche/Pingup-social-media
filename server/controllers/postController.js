import fs from "fs";
import imagekit from "../configs/imagekit.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

// Add post
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;

    console.log('Creating post with userId:', userId, 'type:', typeof userId);

    let image_urls = [];

    if (images && images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });

          const url = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "512" },
            ],
          });

          return url;
        })
      );
    }

    const postData = {
      user: userId,
      content,
      image_urls,
      post_type,
    };

    console.log('Post data to create:', postData);

    const newPost = await Post.create(postData);
    console.log('Post created successfully:', newPost._id);

    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.error('Error creating post:', error);
    res.json({ success: false, message: error.message });
  }
};

// Get posts for feed
export const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    console.log('Fetching feed for userId:', userId, 'type:', typeof userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Get all users the current user can see posts from
    const visibleUserIds = [userId]; // Always see own posts
    
    // Add users from connections (mutual connections)
    if (user.connections && user.connections.length > 0) {
      visibleUserIds.push(...user.connections);
    }
    
    // Add users from following (but only if they're public OR if we're in their followers list)
    if (user.following && user.following.length > 0) {
      for (const followingId of user.following) {
        try {
          const followingUser = await User.findById(followingId);
          if (followingUser) {
            // Can see posts if:
            // 1. User is public, OR
            // 2. User is private but we're in their followers list (mutual follow)
            if (followingUser.account_type === 'public' || followingUser.followers.includes(userId)) {
              visibleUserIds.push(followingId);
            }
          }
        } catch (error) {
          console.error('Error checking following user:', followingId, error);
        }
      }
    }

    console.log('User IDs to fetch posts for:', visibleUserIds);
    
    // First get posts without populate to avoid casting issues
    const posts = await Post.find({ user: { $in: visibleUserIds } })
      .sort({ createdAt: -1 });

    console.log('Found posts:', posts.length);
    
    // Now manually populate user data to avoid casting issues
    const populatedPosts = await Promise.all(
      posts.map(async (post) => {
        try {
          const userData = await User.findById(post.user);
          return {
            ...post.toObject(),
            user: userData || { _id: post.user, full_name: 'Unknown User', username: 'unknown' }
          };
        } catch (error) {
          console.error('Error populating user for post:', post._id, error);
          return {
            ...post.toObject(),
            user: { _id: post.user, full_name: 'Unknown User', username: 'unknown' }
          };
        }
      })
    );

    res.json({ success: true, posts: populatedPosts });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    res.json({ success: false, message: error.message });
  }
};

// Like or unlike a post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (!Array.isArray(post.likes)) post.likes = [];

    // Safe comparison that handles both String and ObjectId
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.likes_count = post.likes.length;
      await post.save();
      return res.json({ success: true, message: "Post unliked", likes: post.likes });
    } else {
      post.likes.push(userId);
      post.likes_count = post.likes.length;
      await post.save();
      return res.json({ success: true, message: "Post liked", likes: post.likes });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add comment to a post
export const addComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId, content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Add comment
    const newComment = {
      user: userId,
      content: content.trim(),
      created_at: new Date()
    };

    post.comments.push(newComment);
    post.comments_count = post.comments.length;
    await post.save();

    // Populate user data for the new comment
    try {
      const userData = await User.findById(userId);
      const populatedComment = {
        ...newComment,
        user: userData || { _id: userId, full_name: 'Unknown User', username: 'unknown' }
      };

      res.json({ 
        success: true, 
        message: "Comment added successfully", 
        comment: populatedComment,
        comments_count: post.comments_count
      });
    } catch (error) {
      res.json({ 
        success: true, 
        message: "Comment added successfully", 
        comment: newComment,
        comments_count: post.comments_count
      });
    }

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You can only delete your own posts" });
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: "Post deleted successfully" });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Populate user data for comments
    const populatedComments = await Promise.all(
      post.comments.map(async (comment) => {
        try {
          const userData = await User.findById(comment.user);
          return {
            ...comment.toObject(),
            user: userData || { _id: comment.user, full_name: 'Unknown User', username: 'unknown' }
          };
        } catch (error) {
          return {
            ...comment.toObject(),
            user: { _id: comment.user, full_name: 'Unknown User', username: 'unknown' }
          };
        }
      })
    );

    res.json({ success: true, comments: populatedComments });

  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
