import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.Mixed, ref: "User", required: true },
  content: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.Mixed, ref: "User", required: true }, // Changed to Mixed to handle both String and ObjectId
  content: { type: String },
  image_urls: [{ type: String }],
  post_type: { type: String, enum: ["text", "image", "text_with_image"], required: true },
  likes: [{ type: mongoose.Schema.Types.Mixed, ref: "User", default: [] }], // Changed to Mixed to handle both String and ObjectId
  likes_count: { type: Number, default: 0 },
  comments: [commentSchema], // Added comments array
  comments_count: { type: Number, default: 0 }, // Added comments count
}, { timestamps: true, minimize: false });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
