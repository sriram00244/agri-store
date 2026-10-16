import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    harvestDate: { type: Date, required: true },
    productImage: { type: String, default: '' },
    channelId: { type: String, default: '' },
    readKey: { type: String, default: '' },
    emailAlerts: { type: String }, // Optional alternative email
    phoneAlerts: { type: String }, // Optional phone
    lastAlertSent: { type: Date }
}, { timestamps: true });

const Farm = mongoose.model('Farm', farmSchema);
export default Farm;
