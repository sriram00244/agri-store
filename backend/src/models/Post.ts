import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['General', 'Market', 'Pests', 'Buy', 'Sell', 'Question', 'Tip'], default: 'General' },
    image: { type: String }, // Optional image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
