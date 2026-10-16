import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Farm from '../models/Farm';
import Post from '../models/Post';
import MarketData from '../models/MarketData';
import SensorData from '../models/SensorData';

export const getDatabaseOverview = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).select('-password');
        const farms = await Farm.find({});
        const posts = await Post.find({});
        const marketData = await MarketData.find({});
        const sensorData = await SensorData.find({});

        const dbStats = {
            databaseType: mongoose.connection.host.includes('127.0.0.1') || mongoose.connection.host.includes('localhost') 
                ? 'In-Memory MongoDB (Active & Running)' 
                : `Connected MongoDB (${mongoose.connection.host})`,
            connectionState: mongoose.connection.readyState === 1 ? 'Connected (1)' : 'Disconnected',
            summary: {
                usersCount: users.length,
                farmsCount: farms.length,
                postsCount: posts.length,
                marketDataCount: marketData.length,
                sensorDataCount: sensorData.length
            },
            collections: {
                users,
                farms,
                posts,
                marketData,
                sensorData
            }
        };

        res.json(dbStats);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to inspect database', error: error.message });
    }
};
