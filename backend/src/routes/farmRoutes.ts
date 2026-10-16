import express from 'express';
import { addFarm, getFarms, getFarmData } from '../controllers/farmController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getFarms)
    .post(addFarm);

router.get('/:id/data', getFarmData);

export default router;
