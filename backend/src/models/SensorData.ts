import mongoose from 'mongoose';

const sensorDataSchema = new mongoose.Schema({
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    temperature: { type: Number },
    humidity: { type: Number },
    soilMoisture: { type: Number },
    lightIntensity: { type: Number },
    recordedAt: { type: Date, default: Date.now }
});

// Index for efficient querying by farm and time
sensorDataSchema.index({ farm: 1, recordedAt: -1 });

const SensorData = mongoose.model('SensorData', sensorDataSchema);
export default SensorData;
