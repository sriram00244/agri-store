import mongoose, { Document, Schema } from 'mongoose';

export interface IOfficerRequest extends Document {
    referenceNumber: string;
    user?: mongoose.Types.ObjectId;
    farmerName: string;
    district: string;
    village: string;
    cropName: string;
    problemCategory: string;
    description: string;
    mobileNumber: string;
    status: 'Pending' | 'Under Review' | 'Officer Assigned' | 'Resolved';
    assignedOffice: string;
    officerNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OfficerRequestSchema: Schema = new Schema({
    referenceNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    farmerName: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String, required: true },
    cropName: { type: String, required: true },
    problemCategory: {
        type: String,
        required: true,
        enum: [
            'Crop disease',
            'Pest attack',
            'Fertilizer guidance',
            'Soil testing',
            'Irrigation problems',
            'Cultivation cost guidance',
            'Market price information',
            'Government schemes'
        ]
    },
    description: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Officer Assigned', 'Resolved'],
        default: 'Pending'
    },
    assignedOffice: { type: String, default: 'Department of Agriculture, Tamil Nadu' },
    officerNotes: { type: String, default: 'Your request has been registered with the local agricultural extension wing. A designated officer will contact your mobile number shortly.' }
}, {
    timestamps: true
});

export default mongoose.model<IOfficerRequest>('OfficerRequest', OfficerRequestSchema);
