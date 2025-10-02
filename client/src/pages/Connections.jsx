import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
  UserX,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");
  const [connections, setConnections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [pendingFollowers, setPendingFollowers] = useState([]); // Added pending followers
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user/connections", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setConnections(data.connections || []);
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
        setPendingConnections(data.pendingConnections || []);
        setPendingFollowers(data.pendingFollowers || []); // Set pending followers
      } else {
        toast.error(data.message || "Failed to fetch connections");
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const { data } = await api.post(
        "/api/user/follow",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchConnections(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchConnections(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleAcceptConnection = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));
      const { data } = await api.post(
        "/api/user/accept-connection",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchConnections(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Added function to accept follow request
  const handleAcceptFollowRequest = async (followerId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [followerId]: true }));
      const { data } = await api.post(
        "/api/user/accept-follow-request",
        { followerId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchConnections(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error accepting follow request:", error);
      toast.error("Failed to accept follow request");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [followerId]: false }));
    }
  };

  // Added function to reject follow request
  const handleRejectFollowRequest = async (followerId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [followerId]: true }));
      const { data } = await api.post(
        "/api/user/reject-follow-request",
        { followerId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchConnections(); // Refresh the data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      toast.error("Failed to reject follow request");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [followerId]: false }));
    }
  };

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
    { label: "Follow Requests", value: pendingFollowers, icon: UserRoundPen }, // Added follow requests tab
  ];

  if (loading) {
    return <Loading height="60vh" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* counts */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md"
            >
              <b>{item.value.length}</b>
              <p className="text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm">
          {dataArray.map((tab) => (
            <button
              onClick={() => setCurrentTab(tab.label)}
              key={tab.label}
              className={`cursor-pointer flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                currentTab === tab.label
                  ? "bg-white font-medium text-black"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="ml-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* connections */}
        <div className="flex flex-wrap gap-6 mt-6">
          {dataArray
            .find((item) => item.label === currentTab)
            ?.value.map((user) => (
              <div
                key={user._id}
                className="w-full max-w-88 flex gap-5 p-6 bg-white shadow rounded-md"
              >
                <img
                  src={user.profile_picture}
                  className="rounded-full w-12 h-12 shadow-md mx-auto"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{user.full_name}</p>
                  <p className="text-slate-500">@{user.username}</p>
                  <p className="text-gray-600 text-sm">
                    {user.bio?.slice(0, 30)}...
                  </p>

                  <div className="flex max-sm:flex-col gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer"
                    >
                      View Profile
                    </button>

                    {currentTab === "Following" && (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        disabled={followLoading[user._id]}
                        className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {followLoading[user._id] ? "Unfollowing..." : "Unfollow"}
                      </button>
                    )}

                    {currentTab === "Pending" && (
                      <button
                        onClick={() => handleAcceptConnection(user._id)}
                        disabled={followLoading[user._id]}
                        className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {followLoading[user._id] ? "Accepting..." : "Accept"}
                      </button>
                    )}

                    {currentTab === "Follow Requests" && (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleAcceptFollowRequest(user._id)}
                          disabled={followLoading[user._id]}
                          className="flex-1 p-2 text-sm rounded bg-green-500 hover:bg-green-600 text-white active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {followLoading[user._id] ? "Accepting..." : "Accept"}
                        </button>
                        <button
                          onClick={() => handleRejectFollowRequest(user._id)}
                          disabled={followLoading[user._id]}
                          className="flex-1 p-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <UserX className="w-4 h-4" />
                          {followLoading[user._id] ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    )}

                    {currentTab === "Connections" && (
                      <button
                        onClick={() => navigate(`/messages/${user._id}`)}
                        className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
