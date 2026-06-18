import express from 'express';
import { getMarketPrices } from '../Controllers/Market.controller.js';

const router = express.Router();
router.get('/prices', getMarketPrices);

export default router;