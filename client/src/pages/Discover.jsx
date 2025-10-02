import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { getToken } = useAuth();

  const handleSearch = async (e) => {
    if (e.key === "Enter" && input.trim()) {
      try {
        setLoading(true);
        setSearchPerformed(true);

        const { data } = await api.post(
          "/api/user/discover",
          { input: input.trim() },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        );

        if (data.success) {
          setUsers(data.users || []);
        } else {
          toast.error(data.message || "Search failed");
          setUsers([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        toast.error("Search failed");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!e.target.value.trim()) {
      setUsers([]);
      setSearchPerformed(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md text-sm"
                onChange={handleInputChange}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loading height="60vh" />
        ) : searchPerformed ? (
          users.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {users.map((user) => (
                <UserCard user={user} key={user._id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try searching with different keywords
              </p>
            </div>
          )
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">
              Discover Images
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 1,
                  image:
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
                  title: "Mountain Adventure",
                  likes: 1250,
                  user: "nature_lover",
                },
                {
                  id: 2,
                  image:
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
                  title: "Coffee & Code",
                  likes: 890,
                  user: "developer_life",
                },
                {
                  id: 3,
                  image:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
                  title: "City Lights",
                  likes: 2100,
                  user: "urban_explorer",
                },
             
              ].map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={image.image}
                    alt={image.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {image.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">@{image.user}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500">❤️</span>
                        <span className="text-sm text-gray-600">
                          {image.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
