import { Trade } from "../models/trade.model";
import type { GetTradesParams } from "../types/trade/trade-query.types";
import type { ITrade } from "../types/trade/trade.types";
import AppError from "../errors/app-error";

export const createTradeService = async (data: ITrade) => {
  const trade = await Trade.create(data);
  return trade;
};

export const getTradesService = async (params: GetTradesParams) => {
  const {
    page,
    limit,
    status,
    marketType,
    symbol,
    tradeType,
    startDate,
    endDate,
  } = params;
  //
  const filter = {
    ...(status ? { status } : {}),
    ...(marketType ? { marketType } : {}),
    ...(symbol ? { symbol } : {}),
    ...(tradeType ? { tradeType } : {}),
  };

  // Adjust endDate to include the entire day
  const endDateExclusive = endDate ? new Date(endDate) : undefined;
  if (endDateExclusive) {
    endDateExclusive.setUTCDate(endDateExclusive.getUTCDate() + 1);
  }

  const dateFilter =
    startDate || endDate
      ? {
          tradeDate: {
            ...(startDate ? { $gte: startDate } : {}),
            ...(endDateExclusive ? { $lt: endDateExclusive } : {}),
          },
        }
      : {};
  const combinedFilter = { ...filter, ...dateFilter };

  const totalTrades = await Trade.countDocuments(combinedFilter);
  const totalPages = Math.ceil(totalTrades / limit);
  // Validate that the requested page is not greater than the total number of pages
  if (page > totalPages && totalTrades > 0) {
    throw new AppError("Page not found", 404);
  }
  // Retrieve trades
  const trades = await Trade.find(combinedFilter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return {
    trades,
    pagination: {
      totalTrades,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};


