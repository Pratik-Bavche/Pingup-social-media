import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/message/recent", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentMessages();
  }, []);

  if (loading) {
    return (
      <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
        <div className="font-semibold text-slate-800 mb-4">Recent Messages</div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Default messages when no real messages
  const defaultMessages = [
    {
      _id: "msg1",
      from_user_id: {
        _id: "user1",
        full_name: "Rohit Sharma",
        profile_picture:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      },
      text: "Hey! How are you doing?",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      seen: false,
    },
    {
      _id: "msg2",
      from_user_id: {
        _id: "user2",
        full_name: "Narendra Modi",
        profile_picture:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      text: "Great work on the project!",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      seen: true,
    },
    {
      _id: "msg3",
      from_user_id: {
        _id: "user3",
        full_name: "Virat Kohli",
        profile_picture:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      },
      text: "See you tomorrow!",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      seen: false,
    },
  ];

  const displayMessages = messages.length > 0 ? messages : defaultMessages;

  return (
    <div className="bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800">
      <div className="font-semibold text-slate-800 mb-4">Recent Messages</div>
      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
        {displayMessages.map((message, index) => (
          <Link
            to={`/messages/${message.from_user_id._id}`}
            key={message._id || index}
            className="flex items-start gap-2 py-2 hover:bg-slate-100 rounded px-1"
          >
            <img
              src={message.from_user_id?.profile_picture}
              className="w-8 h-8 rounded-full"
              alt="profile"
            />
            <div className="w-full">
              <div className="flex justify-between">
                <p className="font-medium">
                  {message.from_user_id?.full_name || "Unknown User"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {moment(message.createdAt).fromNow()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500 truncate max-w-32">
                  {message.text ? message.text : "media"}
                </p>
                {!message.seen && (
                  <p className="bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0">
                    1
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;
