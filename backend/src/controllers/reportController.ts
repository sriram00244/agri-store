import { Request, Response } from 'express';
import User from '../models/User';
import SensorData from '../models/SensorData';
// Static import is safer for reliability
import { sendEmailAlert } from '../services/emailService';

export const sendInstantReport = async (req: Request, res: Response) => {
    const { email } = req.body;
    // @ts-ignore
    const userId = req.user._id;

    console.log(`📝 Processing Report Request for: ${email || 'stored user email'}`);

    try {
        // 1. Update User Email if provided - REMOVED to prevent duplicate key errors
        // if (email) {
        //    await User.findByIdAndUpdate(userId, { email });
        // }

        // 2. Fetch Latest Sensor Data
        let latestData = await SensorData.findOne({ farm: req.body.farmId }).sort({ createdAt: -1 });

        // Default data if new farm
        const data = latestData || {
            temperature: 28.5,
            humidity: 62,
            soilMoisture: 45,
            lightIntensity: 850
        };

        // 3. Construct Email Content
        const timestamp = new Date().toLocaleString();
        const sensorText = `🌡 Temp: ${data.temperature}°C\n💧 Humidity: ${data.humidity}%\n🌱 Moisture: ${data.soilMoisture}%\n☀ Light: ${data.lightIntensity} lx`;

        const emailSubject = "🌱 Agrostores Sensor Report";
        const emailBody = `Agrostores Smart Farm Report\n\nGenerated on: ${timestamp}\n\n${sensorText}\n\nSystem Status: Normal\n\nVisit your dashboard for more analytics.`;

        // 4. Send Email
        const targetEmail = email || (await User.findById(userId))?.email;
        if (!targetEmail) return res.status(400).json({ message: "Email address required." });

        console.log(`📨 Calling Email Service for: ${targetEmail}`);
        const result = await sendEmailAlert(targetEmail, emailSubject, emailBody);
        console.log('📨 Service Result:', result);

        // 5. Handle Result
        if (result.success) {
            res.status(200).json({ message: `Report sent successfully!` });
        } else {
            console.error('❌ Report sending failed:', result.message);
            const statusCode = (result.type === 'config_error' || result.type === 'invalid_email') ? 400 : 500;
            res.status(statusCode).json({ message: result.message });
        }

    } catch (error: any) {
        console.error("❌ Report Controller Critical Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
