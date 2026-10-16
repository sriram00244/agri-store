import { Request, Response } from 'express';
import Post from '../models/Post';

export const getPosts = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        const filter = category ? { category } : {};

        const posts = await Post.find(filter)
            .populate('user', 'name location')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPost = async (req: any, res: Response) => {
    const { content, category, image } = req.body;
    try {
        const post = await Post.create({
            user: req.user._id,
            content,
            category,
            image
        });
        const populatedPost = await Post.findById(post._id).populate('user', 'name location');
        res.status(201).json(populatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const likePost = async (req: any, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user._id)) {
            // Unlike
            post.likes = post.likes.filter((id: any) => id.toString() !== req.user._id.toString());
        } else {
            // Like
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const commentPost = async (req: any, res: Response) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };
        post.comments.push(comment);
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name location')
            .populate('comments.user', 'name');

        res.json(populatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePost = async (req: any, res: Response) => {
    try {
        const post: any = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted', _id: req.params.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
