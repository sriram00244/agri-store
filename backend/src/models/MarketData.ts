import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema({
    commodity: { type: String, required: true },
    state: { type: String, required: true },
    market: { type: String },
    minPrice: { type: Number },
    maxPrice: { type: Number },
    modalPrice: { type: Number },
    date: { type: Date, default: Date.now }
});

const MarketData = mongoose.model('MarketData', marketDataSchema);
export default MarketData;
