import type { ITrade } from './../types/trade/trade.types';
import { TradeStatus } from './../types/enums/trade-status.enum';
import { TradeEmotion } from './../types/enums/trade-emotion.enum';
import { MarketType } from './../types/enums/market-type.enum';
import { Schema, model } from 'mongoose';
import { TradeType } from './../types/enums/trade.type.enum';

const tradeSchema = new Schema<ITrade>(
  {
    accountId: {
      type: String,
      required: true,
      trim: true,
    },

    marketType: {
      type: String,
      enum: Object.values(MarketType),
      required: true,
    },

    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    entryPrice: {
      type: Number,
      required: true,
      min: [Number.MIN_VALUE, 'Entry price must be greater than zero'],
    },

    exitPrice: {
      type: Number,
      min: [Number.MIN_VALUE, 'Exit price must be greater than zero'],
    },

    exitDate: {
      type: Date,
    },

    stopLoss: {
      type: Number,
      min: [Number.MIN_VALUE, 'Stop loss must be greater than zero'],
    },

    takeProfit: {
      type: Number,
      min: [Number.MIN_VALUE, 'Take profit must be greater than zero'],
    },

    quantity: {
      type: Number,
      required: true,
      min: [Number.MIN_VALUE, 'Quantity must be greater than zero'],
    },

    fees: {
      type: Number,
      default: 0,
      min: [0, 'Fees cannot be negative'],
    },

    strategy: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(TradeStatus),
      required: true,
      default: TradeStatus.OPEN,
    },

    tradeDate: {
      type: Date,
      required: true,
    },

    tradeType: {
      type: String,
      enum: Object.values(TradeType),
      required: true,
    },

    emotion: {
      type: String,
      enum: Object.values(TradeEmotion),
      required: true,
      default: TradeEmotion.NEUTRAL,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },

  {
    timestamps: true,
    versionKey: false,
  },
);

export const Trade = model<ITrade>('Trade', tradeSchema);
