import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import PostCard from "../components/PostCard";
import StoriesBar from "../components/StoriesBar";
import StoryViewer from "../components/StoryViewer";
import RecentMessages from "../components/RecentMessages";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewStory, setViewStory] = useState(null);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [followCounts, setFollowCounts] = useState({
    user1: 1250000, // Rohit Sharma
    user2: 8900000, // Narendra Modi
    user3: 4500000, // Virat Kohli
    user4: 150000000, // Elon Musk
    user5: 85000000, // Priyanka Chopra
  });
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setPosts(data.posts || []);
      } else {
        toast.error(data.message || "Failed to fetch posts");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((post) => post._id !== deletedPostId)
    );
  };

  const handleFollow = (userId) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        setFollowCounts((prev) => ({
          ...prev,
          [userId]: prev[userId] - 1,
        }));
        toast.success("Unfollowed successfully");
      } else {
        newSet.add(userId);
        setFollowCounts((prev) => ({
          ...prev,
          [userId]: prev[userId] + 1,
        }));
        toast.success("Followed successfully");
      }
      return newSet;
    });
  };

  if (loading) {
    return <Loading height="60vh" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-screen">
          {/* Left Sidebar - Fixed */}
          <div className="hidden lg:block lg:col-span-2 sticky top-6 h-fit">
            {/* Left sidebar content can be added here */}
          </div>

          {/* Main Content - Scrollable */}
          <div className="lg:col-span-7 h-screen overflow-y-auto no-scrollbar">
            {/* Stories - Fixed at top */}
            <div className="sticky top-0 bg-slate-50 z-10 pb-4">
              <StoriesBar viewStory={viewStory} setViewStory={setViewStory} />
            </div>

            {/* Posts - Scrollable content */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No posts to show</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Follow some users to see their posts here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onDelete={handlePostDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Fixed with proper gap */}
          <div className="hidden lg:block lg:col-span-3 sticky top-6 h-fit space-y-4 pl-4">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold text-slate-800 mb-4">Suggestions</h3>
              <div className="space-y-3">
                {/* Rohit Sharma */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                      className="w-10 h-10 rounded-full"
                      alt="Rohit Sharma"
                    />
                    <div>
                      <p className="font-medium text-sm">Rohit Sharma</p>
                      <p className="text-xs text-gray-500">
                        {followCounts.user1.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow("user1")}
                    className={`text-xs cursor-pointer px-3 py-1 rounded-full transition ${
                      followedUsers.has("user1")
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    {followedUsers.has("user1") ? "Unfollow" : "Follow"}
                  </button>
                </div>

                {/* Narendra Modi */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      className="w-10 h-10 rounded-full"
                      alt="Narendra Modi"
                    />
                    <div>
                      <p className="font-medium text-sm">Narendra Modi</p>
                      <p className="text-xs text-gray-500">
                        {followCounts.user2.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow("user2")}
                    className={`text-xs cursor-pointer px-3 py-1 rounded-full transition ${
                      followedUsers.has("user2")
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    {followedUsers.has("user2") ? "Unfollow" : "Follow"}
                  </button>
                </div>

                {/* Virat Kohli */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
                      className="w-10 h-10 rounded-full"
                      alt="Virat Kohli"
                    />
                    <div>
                      <p className="font-medium text-sm">Virat Kohli</p>
                      <p className="text-xs text-gray-500">
                        {followCounts.user3.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow("user3")}
                    className={`text-xs cursor-pointer px-3 py-1 rounded-full transition ${
                      followedUsers.has("user3")
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    {followedUsers.has("user3") ? "Unfollow" : "Follow"}
                  </button>
                </div>

                {/* Elon Musk */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                      className="w-10 h-10 rounded-full"
                      alt="Elon Musk"
                    />
                    <div>
                      <p className="font-medium text-sm">Elon Musk</p>
                      <p className="text-xs text-gray-500">
                        {followCounts.user4.toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow("user4")}
                    className={`text-xs cursor-pointer px-3 py-1 rounded-full transition ${
                      followedUsers.has("user4")
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    {followedUsers.has("user4") ? "Unfollow" : "Follow"}
                  </button>
                </div>

               
               
              </div>
            </div>

            {/* Recent Messages */}
            <RecentMessages />
          </div>
        </div>
      </div>

      {/* Story Viewer - Rendered at root level */}
      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default Feed;
