import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    content: { type: String },
    media_url: { type: String }, // Fixed: was media_urls (plural)
    media_type: { type: String, enum: ['text', 'image', 'video'] },
    views_count: [{ type: String, ref: 'User' }],
    background_color: { type: String, default: '#4f46e5' },
}, { timestamps: true, minimize: false });

const Story = mongoose.model('Story', storySchema); // Fixed: was 'Post'

export default Story;