import type { TradeType } from './../enums/trade.type.enum';
import type { TradeEmotion } from './../enums/trade-emotion.enum';
import type { TradeStatus } from './../enums/trade-status.enum';
import type { MarketType } from './../enums/market-type.enum';

export interface ITrade {
  accountId: string;

  marketType: MarketType;
  symbol: string;

  entryPrice: number;
  exitPrice?: number;

  stopLoss?: number;
  takeProfit?: number;

  quantity: number;

  fees: number;

  // profitLoss?: number;
  // riskRewardRatio?: number;

  strategy?: string;

  status: TradeStatus;

  tradeDate: Date;
  exitDate?: Date;

  tradeType: TradeType;

  emotion?: TradeEmotion;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}
