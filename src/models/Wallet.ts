import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  budget: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

WalletSchema.index({ userId: 1, isActive: 1 });
WalletSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model<IWallet>('Wallet', WalletSchema);