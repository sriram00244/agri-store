import mongoose, { Document, Schema } from 'mongoose';

export interface ICultivationReport extends Document {
    user?: mongoose.Types.ObjectId;
    farmerName: string;
    cropName: string;
    landArea: number;
    seedsCost: number;
    fertilizerCost: number;
    labourCost: number;
    irrigationCost: number;
    pesticideCost: number;
    machineryCost: number;
    otherExpenses: number;
    totalCost: number;
    costPerAcre: number;
    expectedYield: number;
    expectedPrice: number;
    expectedRevenue: number;
    estimatedProfit: number;
    notes?: string;
    createdAt: Date;
}

const CultivationReportSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    farmerName: { type: String, default: 'Farmer' },
    cropName: { type: String, required: true },
    landArea: { type: Number, required: true },
    seedsCost: { type: Number, default: 0 },
    fertilizerCost: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    irrigationCost: { type: Number, default: 0 },
    pesticideCost: { type: Number, default: 0 },
    machineryCost: { type: Number, default: 0 },
    otherExpenses: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
    costPerAcre: { type: Number, required: true },
    expectedYield: { type: Number, default: 0 },
    expectedPrice: { type: Number, default: 0 },
    expectedRevenue: { type: Number, default: 0 },
    estimatedProfit: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICultivationReport>('CultivationReport', CultivationReportSchema);
