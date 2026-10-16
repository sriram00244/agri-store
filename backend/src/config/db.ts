import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        let isMemoryServer = false;

        if (mongoUri) {
            try {
                const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
                console.log(`MongoDB Connected: ${conn.connection.host}`);
                return;
            } catch (err) {
                console.log('Failed to connect to local MongoDB. Falling back to In-Memory Database...');
            }
        }

        console.log('Using In-Memory MongoDB...');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        isMemoryServer = true;

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
