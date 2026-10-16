import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { startPolling } from './services/pollingService';

connectDB();
startPolling();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: (process.env.CLIENT_URL || "http://localhost:5173"),
        methods: ["GET", "POST"]
    }
});

app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('Agrostores API is running...');
});

import authRoutes from './routes/authRoutes';
import farmRoutes from './routes/farmRoutes';
import apiRoutes from './routes/apiRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api', apiRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('send_message', (data) => {
        io.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email Service Configured: ${process.env.EMAIL_USER ? 'YES' : 'NO'}`);
});
