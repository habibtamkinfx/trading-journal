import { Trade } from "../models/trade.model";
import type { ITrade } from "../types/trade/trade.types";

export const createTradeService = async (data: ITrade) => {
  const trade = await Trade.create(data);
  return trade;
};
