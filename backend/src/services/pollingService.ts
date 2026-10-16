import Farm from '../models/Farm';
import SensorData from '../models/SensorData';
import { fetchChannelFeeds } from './thingSpeakService';
import { sendEmailAlert } from './emailService';
import { sendSMSAlert } from './smsService';
import User from '../models/User';

const POLLING_INTERVAL = 15000; // 15 seconds
const ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour

export const startPolling = () => {
    console.log('Starting IoT Polling Service...');
    setInterval(async () => {
        try {
            const farms = await Farm.find({});
            for (const farm of farms) {
                await processFarmData(farm);
            }
        } catch (error) {
            console.error('Polling Error:', error);
        }
    }, POLLING_INTERVAL);
};

const processFarmData = async (farm: any) => {
    try {
        const data = await fetchChannelFeeds(farm.channelId, farm.readKey, 1);
        if (!data || !data.feeds || data.feeds.length === 0) return;

        const latest = data.feeds[0];
        const sensorData = {
            farm: farm._id,
            soilMoisture: parseFloat(latest.field1) || 0,
            temperature: parseFloat(latest.field2) || 0,
            humidity: parseFloat(latest.field3) || 0,
            lightIntensity: parseFloat(latest.field4) || 0,
            recordedAt: new Date(latest.created_at)
        };

        // Check if data is new (compare timestamp with last saved?)
        // For simplicity, just save. DB constraints/time-series optimization usually needed here.
        await SensorData.create(sensorData);

        // Check Alerts
        await checkAlerts(farm, sensorData);

    } catch (error) {
        // console.error(`Error processing farm ${farm.name}:`, error);
    }
};

const checkAlerts = async (farm: any, data: any) => {
    const now = new Date();
    if (farm.lastAlertSent && (now.getTime() - new Date(farm.lastAlertSent).getTime() < ALERT_COOLDOWN)) {
        return; // In cooldown
    }

    let alertMessage = '';
    if (data.soilMoisture < 30) alertMessage += `Low Soil Moisture: ${data.soilMoisture}%. `;
    if (data.temperature > 40) alertMessage += `High Temperature: ${data.temperature}°C. `;

    if (alertMessage) {
        console.log(`Sending Alert for ${farm.name}: ${alertMessage}`);

        const user = await User.findById(farm.user);
        if (!user) return;

        const email = farm.emailAlerts || user.email;
        const phone = farm.phoneAlerts || user.phone;

        if (user.notifications?.email) {
            await sendEmailAlert(email, `Agrostores Alert: ${farm.name}`, alertMessage);
        }

        if (user.notifications?.sms && phone) {
            await sendSMSAlert(phone, `Agrostores Alert [${farm.name}]: ${alertMessage}`);
        }

        farm.lastAlertSent = now;
        await farm.save();
    }
};
