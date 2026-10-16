import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;

    try {
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSymbol = /[^a-zA-Z0-9]/.test(password);

        if (!hasLetter || !hasNumber || !hasSymbol) {
            return res.status(400).json({ message: 'Password must contain a combination of letters, numbers, and symbols' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password hashing is handled by pre-save hook in User model
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                message: 'Registration successful. Please login.'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user: any = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                notifications: user.notifications,
                token: generateToken(user._id.toString())
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserProfile = async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            notifications: user.notifications
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserProfile = async (req: any, res: Response) => {
    try {
        const user: any = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, location, phone, notifications } = req.body;

        if (name !== undefined) user.name = name;
        if (location !== undefined) user.location = location;
        if (phone !== undefined) user.phone = phone;
        if (notifications !== undefined) {
            user.notifications = { ...user.notifications, ...notifications };
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            notifications: updatedUser.notifications,
            message: 'Profile updated successfully'
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
