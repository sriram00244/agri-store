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
    try {
        const response = await axios.get(`${THINGSPEAK_URL}/channels/${channelId}/feeds.json?api_key=${readKey}&results=${results}`);
        return response.data;
    } catch (error) {
        console.error('ThingSpeak Fetch Error:', error);
        throw new Error('Failed to fetch data from ThingSpeak');
    }
};
