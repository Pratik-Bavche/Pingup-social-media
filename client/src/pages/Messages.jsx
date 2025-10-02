import React, { useState, useEffect } from "react";
import { MessageSquare, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const Messages = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user/connections", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        // Combine connections and following for messaging
        const allConnections = [
          ...(data.connections || []),
          ...(data.following || []),
        ];

        // Remove duplicates and current user
        const uniqueConnections = allConnections.filter(
          (user, index, self) =>
            user._id !== currentUser._id &&
            self.findIndex((u) => u._id === user._id) === index
        );

        setConnections(uniqueConnections);
      } else {
        toast.error(data.message || "Failed to fetch connections");
        setConnections([]);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to fetch connections");
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConnections();
    }
  }, [currentUser]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>

        {/* Connected users */}
        {connections.length === 0 ? (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Recent Conversations
            </h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  _id: "msg1",
                  full_name: "Rohit Sharma",
                  username: "rohitsharma",
                  profile_picture:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
                  lastMessage: "Hey! How are you doing?",
                  time: "2m ago",
                  unread: true,
                },
                {
                  _id: "msg2",
                  full_name: "Narendra Modi",
                  username: "narendramodi",
                  profile_picture:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
                  lastMessage: "Great work on the project!",
                  time: "1h ago",
                  unread: false,
                },
                {
                  _id: "msg3",
                  full_name: "Virat Kohli",
                  username: "imVkohli",
                  profile_picture:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face",
                  lastMessage: "See you tomorrow!",
                  time: "3h ago",
                  unread: true,
                },
                {
                  _id: "msg4",
                  full_name: "Elon Musk",
                  username: "elonmusk",
                  profile_picture:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
                  lastMessage: "The future is exciting!",
                  time: "5h ago",
                  unread: false,
                },
              ].map((user) => (
                <div
                  key={user._id}
                  className="max-w-xl flex items-center gap-4 p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/messages/${user._id}`)}
                >
                  <div className="relative">
                    <img
                      src={user.profile_picture}
                      className="rounded-full size-12"
                      alt={user.full_name}
                    />
                    {user.unread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-700">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{user.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {user.lastMessage}
                    </p>
                  </div>
                  {user.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {connections.map((user) => (
              <div
                key={user._id}
                className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md"
              >
                <img
                  src={user.profile_picture}
                  className="rounded-full size-12 mx-auto"
                  alt={user.full_name}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{user.full_name}</p>
                  <p className="text-slate-500">@{user.username}</p>
                  <p className="text-sm text-gray-600">
                    {user.bio || "No bio available"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="size-10 flex items-center justify-center text-sm
                      rounded bg-slate-100 hover:bg-slate-200 text-slate-800
                      active:scale-95 transition cursor-pointer gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="size-10 flex items-center justify-center text-sm
                      rounded bg-slate-100 hover:bg-slate-200 text-slate-800
                      active:scale-95 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
