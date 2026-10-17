import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';

// Helper to get active or demo user
const getEffectiveUser = async (req: any) => {
    if (req.user && req.user._id) return req.user;
    let fallbackUser = await User.findOne();
    if (!fallbackUser) {
        fallbackUser = await User.create({
            name: 'Tamil Nadu Smart Farmer',
            email: 'farmer@agronix.tn.gov.in',
            password: 'Password123!',
            location: 'Thanjavur, TN',
            language: 'ta'
        });
    }
    return fallbackUser;
};

// Auto seed initial community discussions if empty
const seedCommunityPostsIfEmpty = async () => {
    const count = await Post.countDocuments();
    if (count > 0) return;

    let user = await User.findOne();
    if (!user) {
        user = await User.create({
            name: 'Murugan (முத்துசாமி)',
            email: 'murugan@agronix.tn',
            password: 'Password123!',
            location: 'Thanjavur, TN',
            language: 'ta'
        });
    }

    const initialPosts = [
        {
            user: user._id,
            category: 'General',
            content: 'வணக்கம் உழவர் பெருமக்களே! இந்த ஆண்டு சம்பா நெல் சாகுபடிக்கு புதிய நேரடி விதைப்பு (DSR) முறையை பயன்படுத்தினோம். நீர் பயன்பாடு 30% குறைந்துள்ளது. மற்ற விவசாயிகளுக்கு ஏதேனும் ஆலோசனை தேவையா? (Welcome farmers! We used direct seeded rice for Samba season, water usage reduced by 30%.)',
            likes: [],
            comments: [
                {
                    user: user._id,
                    text: 'மிகச் சிறந்த முயற்சி அய்யா! உரம் இடும் அட்டவணை பகிர முடியுமா?',
                    createdAt: new Date()
                }
            ]
        },
        {
            user: user._id,
            category: 'Pests',
            content: 'தக்காளி மற்றும் கத்தரி பயிரில் இலைப்பேன் மற்றும் அசுவினி தாக்குதலுக்கு 3% வேப்ப எண்ணெய் கரைசல் மற்றும் ஏக்கருக்கு 6 மஞ்சள் ஒட்டும் பொறிகள் நல்ல பலன் தருகிறது. (For tomato pests, 3% neem oil spray and yellow sticky traps work effectively with low cost.)',
            likes: [user._id],
            comments: []
        },
        {
            user: user._id,
            category: 'Market',
            content: 'கோயம்பேடு மற்றும் ஒட்டன்சத்திரம் சந்தைகளில் சின்ன வெங்காயம் மற்றும் தக்காளி விலை உயர்ந்து வருகிறது. இடைத்தரகர் இல்லாமல் நியாயமான விலையில் விற்க அருகிலுள்ள உழவர் உற்பத்தியாளர் நிறுவனங்களை (FPO) தொடர்பு கொள்ளவும்.',
            likes: [],
            comments: []
        }
    ];

    await Post.insertMany(initialPosts);
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        await seedCommunityPostsIfEmpty();
        const { category } = req.query;
        const filter = category && category !== 'All' ? { category } : {};

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
        const activeUser = await getEffectiveUser(req);
        const post = await Post.create({
            user: activeUser._id,
            content,
            category: category || 'General',
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

        const activeUser = await getEffectiveUser(req);
        const userIdStr = activeUser._id.toString();

        if (post.likes.map((id: any) => id.toString()).includes(userIdStr)) {
            // Unlike
            post.likes = post.likes.filter((id: any) => id.toString() !== userIdStr);
        } else {
            // Like
            post.likes.push(activeUser._id);
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

        const activeUser = await getEffectiveUser(req);
        const comment = {
            user: activeUser._id,
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

        const activeUser = await getEffectiveUser(req);
        if (post.user.toString() !== activeUser._id.toString()) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted', _id: req.params.id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
