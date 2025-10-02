import React, { useRef, useState, useEffect } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);

  // Default user profiles for different message IDs
  const defaultUsers = {
    msg1: {
      _id: "msg1",
      full_name: "Rohit Sharma",
      username: "rohitsharma",
      profile_picture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
    },
    msg2: {
      _id: "msg2",
      full_name: "Narendra Modi",
      username: "narendramodi",
      profile_picture:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
    },
    msg3: {
      _id: "msg3",
      full_name: "Virat Kohli",
      username: "imVkohli",
      profile_picture:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face",
    },
    msg4: {
      _id: "msg4",
      full_name: "Elon Musk",
      username: "elonmusk",
      profile_picture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
    },
  };

  // Default messages for different users
  const defaultMessages = {
    msg1: [
      {
        _id: "1",
        from_user_id: "msg1",
        to_user_id: currentUser?._id,
        text: "Hey! How are you doing?",
        message_type: "text",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        _id: "2",
        from_user_id: currentUser?._id,
        to_user_id: "msg1",
        text: "I'm doing great! Thanks for asking. How about you?",
        message_type: "text",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        _id: "3",
        from_user_id: "msg1",
        to_user_id: currentUser?._id,
        text: "Pretty good! Just finished a great match. The team played really well today.",
        message_type: "text",
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ],
    msg2: [
      {
        _id: "4",
        from_user_id: "msg2",
        to_user_id: currentUser?._id,
        text: "Great work on the project!",
        message_type: "text",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "5",
        from_user_id: currentUser?._id,
        to_user_id: "msg2",
        text: "Thank you so much! It means a lot coming from you.",
        message_type: "text",
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
    ],
    msg3: [
      {
        _id: "6",
        from_user_id: "msg3",
        to_user_id: currentUser?._id,
        text: "See you tomorrow!",
        message_type: "text",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "7",
        from_user_id: currentUser?._id,
        to_user_id: "msg3",
        text: "Looking forward to it! What time works for you?",
        message_type: "text",
        createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "8",
        from_user_id: "msg3",
        to_user_id: currentUser?._id,
        text: "How about 2 PM? We can grab some coffee first.",
        message_type: "text",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    msg4: [
      {
        _id: "9",
        from_user_id: "msg4",
        to_user_id: currentUser?._id,
        text: "The future is exciting!",
        message_type: "text",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "10",
        from_user_id: currentUser?._id,
        to_user_id: "msg4",
        text: "Absolutely! What are you most excited about?",
        message_type: "text",
        createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "11",
        from_user_id: "msg4",
        to_user_id: currentUser?._id,
        text: "Space exploration and AI development. The possibilities are endless!",
        message_type: "text",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  // Fetch user profile and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if it's a default message user first
        if (defaultUsers[userId]) {
          setUser(defaultUsers[userId]);
          setMessages(defaultMessages[userId] || []);
          setLoading(false);
          return;
        }

        // Only make API calls for real users
        const token = await getToken();

        // Fetch user profile
        const profileResponse = await api.post(
          "/api/user/profiles",
          { profileId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileResponse.data.success) {
          setUser(profileResponse.data.profile);
        } else {
          // If user not found in API, show loading message instead of error
          setUser(null);
        }

        // Fetch chat messages
        const messagesResponse = await api.post(
          "/api/message/chat",
          { to_user_id: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (messagesResponse.data.success) {
          setMessages(messagesResponse.data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        // Don't show error toast for default users, just set loading to false
        if (!defaultUsers[userId]) {
          toast.error("Failed to load chat");
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, getToken, currentUser]);

  const sendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Please add a message or image");
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("to_user_id", userId);

      if (text.trim()) {
        formData.append("text", text);
      }

      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.post("/api/message/send", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        // Add new message to local state
        const newMessage = {
          ...data.message,
          from_user_id: currentUser._id,
          to_user_id: userId,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setText("");
        setImage(null);

        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img
          src={user.profile_picture}
          className="size-8 rounded-full"
          alt=""
        />
        <div>
          <p className="font-medium">{user.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
        </div>
      </div>

      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${
                    message.from_user_id === currentUser?._id
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`p-3 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                      message.from_user_id === currentUser?._id
                        ? "rounded-bl-none bg-indigo-500 text-white"
                        : "rounded-br-none bg-gray-100"
                    }`}
                  >
                    {message.message_type === "image" && message.media_url && (
                      <img
                        src={message.media_url}
                        alt=""
                        className="w-full max-w-sm rounded-lg mb-1"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                    <p
                      className={`text-xs mt-1 ${
                        message.from_user_id === currentUser?._id
                          ? "text-indigo-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between gap-3 pl-5 pr-4 h-12 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input
            type="text"
            className="flex-1 outline-none text-slate-700 text-sm placeholder:text-gray-400"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && !sending && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
            disabled={sending}
          />

          <label htmlFor="image" className="cursor-pointer">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="h-8 w-8 rounded object-cover"
                alt=""
              />
            ) : (
              <ImageIcon className="size-6 text-gray-400" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files[0])}
              disabled={sending}
            />
          </label>

          <button
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !image)}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
