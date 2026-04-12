import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MasterServiceDocument = MasterService & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class MasterService {
    @Prop({ type: Number, unique: true })
    serviceId: number; // auto-incremented numeric ID: 1001, 1002, 1003...

    @Prop({ default: '' })
    icon: string;

    @Prop({ trim: true })
    title: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ default: true })
    isActive: boolean;
}

export const MasterServiceSchema = SchemaFactory.createForClass(MasterService);

// Auto-increment serviceId starting from 1001 before each save
MasterServiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastDoc = await (this.constructor as any)
            .findOne({}, { serviceId: 1 })
            .sort({ serviceId: -1 })
            .lean();
        this.serviceId = lastDoc?.serviceId ? lastDoc.serviceId + 1 : 1001;
    }
    next();
});
