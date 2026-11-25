import type { MarketType } from "../enums/market-type.enum";
import type { TradeStatus } from "../enums/trade-status.enum";
import type { TradeType } from "../enums/trade.type.enum";

export interface GetTradesParams {
  page: number;
  limit: number;
  status?: TradeStatus;
  marketType?: MarketType;
  symbol?: string;
  tradeType?: TradeType;
  startDate?: Date;
  endDate?: Date;
}
