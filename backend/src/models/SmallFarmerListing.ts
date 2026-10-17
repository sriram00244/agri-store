import mongoose, { Document, Schema } from 'mongoose';

export interface ISmallFarmerListing extends Document {
    farmerName: string;
    mobileNumber: string;
    district: string;
    village: string;
    landAreaAcres: number;
    cropName: string;
    variety?: string;
    quantity: number;
    unit: 'kg' | 'quintal' | 'bag' | 'crate' | 'bundle';
    pricePerUnit: number;
    harvestDate?: string;
    description?: string;
    isOrganic: boolean;
    status: 'Available' | 'Sold' | 'Reserved';
    createdAt: Date;
}

const SmallFarmerListingSchema: Schema = new Schema({
    farmerName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    landAreaAcres: { type: Number, required: true },
    cropName: { type: String, required: true },
    variety: { type: String, default: 'Standard' },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'quintal', 'bag', 'crate', 'bundle'], default: 'kg' },
    pricePerUnit: { type: Number, required: true },
    harvestDate: { type: String, default: '' },
    description: { type: String, default: '' },
    isOrganic: { type: Boolean, default: false },
    status: { type: String, enum: ['Available', 'Sold', 'Reserved'], default: 'Available' }
}, {
    timestamps: true
});

export default mongoose.model<ISmallFarmerListing>('SmallFarmerListing', SmallFarmerListingSchema);
