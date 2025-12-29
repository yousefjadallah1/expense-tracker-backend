import mongoose, { Schema, Document } from 'mongoose';

export type TransactionType = 'expense' | 'income';

export type Category = 
  | 'food'
  | 'gas'
  | 'family'
  | 'coffee'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'health'
  | 'other';

export interface ITransaction extends Document {
  walletId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: Category;
  description?: string;
  date: Date;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'income'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'other'],
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying transactions by wallet
TransactionSchema.index({ walletId: 1, date: -1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);