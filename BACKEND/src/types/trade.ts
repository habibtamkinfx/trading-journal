export enum TradeType {
  BUY = 'buy',
  SELL = 'sell',
}

export enum TradeEmotion {
  HAPPY = 'happy',
  SAD = 'sad',
  NEUTRAL = 'neutral',
}

export enum TradeStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum MarketType {
  FOREX = 'forex',
  CRYPTO = 'crypto',
  STOCK = 'stock',
  COMMODITY = 'commodity',
  INDEX = 'index',
  FUTURES = 'futures',
  OPTIONS = 'options',
}

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
