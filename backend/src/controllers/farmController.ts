import { Request, Response } from 'express';
import Farm from '../models/Farm';
import SensorData from '../models/SensorData';
import { validateChannel, fetchChannelFeeds } from '../services/thingSpeakService';

export const addFarm = async (req: any, res: Response) => {
    console.log("Add Farm Request Body:", req.body);
    console.log("Add Farm User:", req.user);
    const { name, location, harvestDate, productImage, channelId = '', readKey = '', emailAlerts, phoneAlerts } = req.body;

    try {
        if (channelId && readKey) {
            const isValid = await validateChannel(channelId, readKey);
            if (!isValid) {
                return res.status(400).json({ message: 'Invalid ThingSpeak Channel ID or Read Key' });
            }
        }

        const farm = await Farm.create({
            user: req.user._id,
            name,
            location,
            harvestDate,
            productImage,
            channelId,
            readKey,
            emailAlerts,
            phoneAlerts
        });

        res.status(201).json(farm);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getFarms = async (req: any, res: Response) => {
    try {
        const farms = await Farm.find({ user: req.user._id });
        res.json(farms);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getFarmData = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm not found' });
        }

        // Fetch latest data from ThingSpeak
        const data = await fetchChannelFeeds(farm.channelId, farm.readKey, 10);

        // Process and return data
        // Map fields (Field 1=Moisture, 2=Temp, 3=Humidity, 4=Light)
        const processed = data.feeds.map((feed: any) => ({
            created_at: feed.created_at,
            soilMoisture: feed.field1,
            temperature: feed.field2,
            humidity: feed.field3,
            lightIntensity: feed.field4
        }));

        res.json({
            channel: data.channel,
            feeds: processed
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
