import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async () => {
    if (mode === "text" && !text.trim()) {
      toast.error("Please add some text to your story");
      return;
    }

    if (mode === "media" && !media) {
      toast.error("Please select a media file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      if (mode === "text") {
        formData.append("content", text);
        formData.append("media_type", "text");
      } else {
        formData.append("media", media);
        formData.append(
          "media_type",
          media.type.startsWith("image") ? "image" : "video"
        );
        if (text.trim()) {
          formData.append("content", text);
        }
      }

      formData.append("background_color", background);

      const { data } = await api.post("/api/story/add", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success("Story created successfully!");
        setShowModal(false);
        fetchStories(); // Refresh stories
      } else {
        toast.error(data.message || "Failed to create story");
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(error.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur
text-white flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        <div
          className="rounded-lg h-96 flex items-center justify-center
relative"
          style={{ backgroundColor: background }}
        >
          {mode === "text" && (
            <textarea
              className="bg-transparent text-white w-full h-full
p-6 text-lg resize-none focus:outline-none"
              placeholder="What's on your mind?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img src={previewUrl} className="object-contain max-h-full" />
            ) : (
              <video
                src={previewUrl}
                controls={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            ))}
        </div>

        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded-full ring cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "text" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <TextIcon size={18} /> Text
          </button>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === "media" ? "bg-white text-black" : "bg-zinc-800"
            }`}
          >
            <input
              onChange={(e) => {
                handleMediaUpload(e);
                setMode("media");
              }}
              type="file"
              accept="image/*,video/*"
              className="hidden"
            />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        <button
          onClick={handleCreateStory}
          disabled={loading}
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700
 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkle size={18} /> {loading ? "Creating..." : "Create Story"}
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
