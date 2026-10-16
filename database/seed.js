/**
 * Seeds the Agronix MongoDB database with sample data for local development/demo use.
 * Schemas here mirror backend/src/models/*.ts (documented in schema.md). This script is
 * intentionally standalone (plain JS + its own package.json) so it can be run without
 * building the TypeScript backend first.
 *
 * Usage:
 *   cd database
 *   npm install
 *   MONGODB_URI="mongodb://localhost:27017/agronix" node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agronix';

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    location: String,
    language: { type: String, default: 'en' },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false }
    }
}, { timestamps: true });

const farmSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    location: String,
    channelId: String,
    readKey: String,
    emailAlerts: String,
    phoneAlerts: String,
    lastAlertSent: Date
}, { timestamps: true });

const sensorDataSchema = new mongoose.Schema({
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
    temperature: Number,
    humidity: Number,
    soilMoisture: Number,
    lightIntensity: Number,
    recordedAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    category: { type: String, default: 'General' },
    image: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Farm = mongoose.model('Farm', farmSchema);
const SensorData = mongoose.model('SensorData', sensorDataSchema);
const Post = mongoose.model('Post', postSchema);

async function seed() {
    console.log(`Connecting to ${MONGODB_URI} ...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected. Seeding...');

    // Clear existing demo data (safe to skip if you want to keep existing data)
    await Promise.all([
        User.deleteMany({ email: /@agronix\.demo$/ }),
        Farm.deleteMany({}),
        SensorData.deleteMany({}),
        Post.deleteMany({})
    ]);

    const passwordHash = await bcrypt.hash('Demo@1234', 10);

    const demoUser = await User.create({
        name: 'Demo Farmer',
        email: 'demo@agronix.demo',
        password: passwordHash,
        phone: '+919876543210',
        location: 'Chennai, Tamil Nadu',
        notifications: { email: true, sms: false, whatsapp: false }
    });

    const farm = await Farm.create({
        user: demoUser._id,
        name: 'Demo Tomato Field',
        location: 'Chennai, Tamil Nadu',
        channelId: '000000',
        readKey: 'DEMOKEY',
    });

    await SensorData.insertMany([
        { farm: farm._id, temperature: 29.4, humidity: 61, soilMoisture: 42, lightIntensity: 820 },
        { farm: farm._id, temperature: 30.1, humidity: 58, soilMoisture: 38, lightIntensity: 910 },
        { farm: farm._id, temperature: 28.7, humidity: 64, soilMoisture: 45, lightIntensity: 780 }
    ]);

    await Post.create({
        user: demoUser._id,
        content: 'Welcome to the Agronix community! Ask questions, share tips, and discuss market prices here.',
        category: 'General'
    });

    console.log('Seed complete:');
    console.log(`  Demo login -> email: demo@agronix.demo, password: Demo@1234`);
    console.log(`  1 farm, 3 sensor readings, 1 community post created.`);

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
