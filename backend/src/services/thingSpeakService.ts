import axios from 'axios';

const THINGSPEAK_URL = 'https://api.thingspeak.com';

export const validateChannel = async (channelId: string, readKey: string) => {
    try {
        const response = await axios.get(`${THINGSPEAK_URL}/channels/${channelId}/feeds.json?api_key=${readKey}&results=1`);
        return response.status === 200 && response.data.channel;
    } catch (error) {
        return false;
    }
};

export const fetchChannelFeeds = async (channelId: string, readKey: string, results = 1) => {
    if (!channelId || !readKey) {
        return null;
    }
    try {
        const response = await axios.get(`${THINGSPEAK_URL}/channels/${channelId}/feeds.json?api_key=${readKey}&results=${results}`);
        return response.data;
    } catch (error) {
        // Silently skip if network or channel is unavailable in demo environment
        return null;
    }
};

