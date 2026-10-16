import express from 'express';
import { diagnoseCrop } from '../controllers/cropController';
import { getWeather } from '../controllers/weatherController';
import { getMarketPrices, seedMarketData } from '../controllers/marketController';
import { getPosts, createPost, likePost, commentPost, deletePost } from '../controllers/communityController';
import { chatAssistant } from '../controllers/aiController';
import { getDatabaseOverview } from '../controllers/dbController';
import { sendInstantReport } from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Database Inspector Endpoint (Public)
router.get('/db', getDatabaseOverview);

// Market Data (Public)
router.get('/market', getMarketPrices);
router.post('/market/seed', seedMarketData);

// AI Assistant (Public for easy access)
router.post('/ai/chat', chatAssistant);

router.use(protect);

router.post('/crop-doctor/diagnose', diagnoseCrop);
router.get('/weather', getWeather);

// Community
router.get('/community/posts', getPosts);
router.post('/community/posts', createPost);
router.put('/community/posts/:id/like', likePost);
router.post('/community/posts/:id/comment', commentPost);
router.delete('/community/posts/:id', deletePost);

// Reports
router.post('/report/send', sendInstantReport);

export default router;
