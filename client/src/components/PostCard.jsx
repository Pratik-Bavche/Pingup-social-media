import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, MoreVertical } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post, onDelete }) => {
  const postWithHashTags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-indigo-600">$1</span>'
  );

  const [likes, setLikes] = useState(
    Array.isArray(post.likes) ? post.likes : []
  );
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const { data } = await api.post(
        `/api/post/like`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        if (Array.isArray(data.likes)) {
          setLikes(data.likes);
          setLikeCount(data.likes.length);
        } else {
          // fallback: toggle manually
          setLikes((prev) => {
            if (prev.includes(currentUser._id)) {
              const newLikes = prev.filter((id) => id !== currentUser._id);
              setLikeCount(newLikes.length);
              return newLikes;
            } else {
              const newLikes = [...prev, currentUser._id];
              setLikeCount(newLikes.length);
              return newLikes;
            }
          });
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsCommenting(true);
      const { data } = await api.post(
        `/api/post/comment`,
        { postId: post._id, content: commentText },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success("Comment added successfully");
        setComments(prev => [data.comment, ...prev]);
        setCommentCount(data.comments_count);
        setCommentText("");
        setShowComments(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const { data } = await api.delete(
        `/api/post/delete`,
        { 
          data: { postId: post._id },
          headers: { Authorization: `Bearer ${await getToken()}` } 
        }
      );

      if (data.success) {
        toast.success("Post deleted successfully");
        if (onDelete) {
          onDelete(post._id);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const isPostOwner = currentUser && post.user._id === currentUser._id;

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl relative">
      {/* Post Options Menu */}
      {isPostOwner && (
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
              >
                <Trash2 className="w-4 h-4" />
                Delete Post
              </button>
            </div>
          )}
        </div>
      )}

      {/* user info */}
      <div
        onClick={() => navigate("/profile/" + post.user._id)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          className="w-10 h-10 rounded-full shadow"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} ● {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashTags }}
        />
      )}

      {/* images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, index) => (
            <img
              src={img}
              key={index}
              className={`w-full object-cover rounded-lg ${
                post.image_urls.length === 1 ? "col-span-2 h-auto" : "h-48"
              }`}
            />
          ))}
        </div>
      )}

      {/* Comments Section */}
      {showComments && comments.length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <h4 className="font-medium text-gray-700">Comments ({commentCount})</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-3">
                <img
                  src={comment.user.profile_picture || "https://via.placeholder.com/32"}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user.full_name}</span>
                      <span className="text-xs text-gray-500">
                        {moment(comment.created_at).fromNow()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comment Input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-3">
          <img
            src={currentUser?.profile_picture || "https://via.placeholder.com/32"}
            className="w-8 h-8 rounded-full"
            alt=""
          />
          <div className="flex-1">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isCommenting}
            />
          </div>
          <button
            onClick={handleComment}
            disabled={isCommenting || !commentText.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCommenting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 to-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer ${
              currentUser && likes.includes(currentUser._id)
                ? "text-red-500 fill-red-500"
                : ""
            }`}
            onClick={handleLike}
          />
          <span>{likeCount}</span>
        </div>

        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setShowComments(!showComments)}>
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount}</span>
        </div>

        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          <span>{0}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
