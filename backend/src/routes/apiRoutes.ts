import express from 'express';
import { diagnoseCrop } from '../controllers/cropController';
import { getWeather } from '../controllers/weatherController';
import { getMarketPrices, seedMarketData } from '../controllers/marketController';
import { getPosts, createPost, likePost, commentPost, deletePost } from '../controllers/communityController';
import { chatAssistant } from '../controllers/aiController';
import { getDatabaseOverview } from '../controllers/dbController';
import { sendInstantReport } from '../controllers/reportController';
import { protect, optionalProtect } from '../middleware/authMiddleware';

import {
    saveCultivationReport,
    getCultivationReports,
    deleteCultivationReport
} from '../controllers/cultivationController';

import {
    submitOfficerRequest,
    checkOfficerRequestStatus,
    getMyOfficerRequests,
    getVerifiedOfficerContacts
} from '../controllers/officerController';

import {
    getSmallFarmerListings,
    createSmallFarmerListing,
    getNearbyBuyers,
    getGovernmentSchemes,
    getFarmerGroups,
    getPriceComparisons
} from '../controllers/smallFarmerController';

const router = express.Router();

// Database Inspector Endpoint (Public)
router.get('/db', getDatabaseOverview);

// Market Data (Public)
router.get('/market', getMarketPrices);
router.post('/market/seed', seedMarketData);

// AI Assistant (Public for easy access)
router.post('/ai/chat', chatAssistant);

// ROW 1: Cultivation Cost Calculator Endpoints (supports optional/authenticated access)
router.post('/cultivation-reports', optionalProtect, saveCultivationReport);
router.get('/cultivation-reports', optionalProtect, getCultivationReports);
router.delete('/cultivation-reports/:id', optionalProtect, deleteCultivationReport);

// ROW 2: Small-Scale Farmer Support Endpoints
router.get('/small-farmers/listings', getSmallFarmerListings);
router.post('/small-farmers/listings', createSmallFarmerListing);
router.get('/small-farmers/buyers', getNearbyBuyers);
router.get('/small-farmers/schemes', getGovernmentSchemes);
router.get('/small-farmers/groups', getFarmerGroups);
router.get('/small-farmers/comparisons', getPriceComparisons);

// ROW 3: Contact Agriculture Officer Endpoints
router.get('/officer-requests/contacts', getVerifiedOfficerContacts);
router.post('/officer-requests', optionalProtect, submitOfficerRequest);
router.get('/officer-requests/status/:query', checkOfficerRequestStatus);
router.get('/officer-requests/my', optionalProtect, getMyOfficerRequests);

// Weather Forecast & Crop Diagnosis (Public / Optional Auth for all farmers)
router.get('/weather', getWeather);
router.post('/crop-doctor/diagnose', optionalProtect, diagnoseCrop);

// Community Endpoints (Public reading so any farmer can browse posts; optional auth for actions)
router.get('/community/posts', optionalProtect, getPosts);
router.post('/community/posts', optionalProtect, createPost);
router.put('/community/posts/:id/like', optionalProtect, likePost);
router.post('/community/posts/:id/comment', optionalProtect, commentPost);
router.delete('/community/posts/:id', optionalProtect, deletePost);

// Protected routes below (require authenticated session)
router.use(protect);

// Reports
router.post('/report/send', sendInstantReport);

export default router;

