import { type NextFunction, type Request, type Response } from "express";
import { validationResult } from "express-validator";
import {
  createTradeService,
  getTradeService,
  getTradesService,
} from "../services";
import type { ITrade } from "../types/trade/trade.types";
import { parseDateOnly } from "../utils";
import { TradeType } from "../types/enums/trade.type.enum";
import { TradeStatus } from "../types/enums/trade-status.enum";
import { MarketType } from "../types/enums/market-type.enum";
import AppError from "../errors/app-error";

export const createTradeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const messages = result.array().map((err) => err.msg);
    res.status(400).json({
      success: false,
      message: "Bad request",
      data: messages,
      pagination: null,
    });
    return;
  }
  try {
    const data: ITrade = req.body;
    const trade = await createTradeService(data);
    res.status(201).json({
      success: true,
      message: "trade successfully created",
      data: trade,
      pagination: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getTradesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let limitQuery = 10; // Default limit
    if (typeof req.query.limit === "string" && req.query.limit.trim() !== "") {
      limitQuery = Number(req.query.limit);
      limitQuery = Number.isInteger(limitQuery) ? limitQuery : 10;
    }
    const limit = Math.max(Math.min(limitQuery, 100), 1); // Ensure limit is between 1 and 100

    let pageQuery = 1; // Default page
    if (typeof req.query.page === "string" && req.query.page.trim() !== "") {
      pageQuery = Number(req.query.page);
      pageQuery = Number.isInteger(pageQuery) ? pageQuery : 1;
    }
    const page = Math.max(pageQuery, 1); // Ensure page is at least 1

    // Validate status filter
    if (
      req.query.status &&
      !Object.values(TradeStatus).includes(req.query.status as TradeStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
        data: null,
        pagination: null,
      });
    }

    // Validate marketType filter
    if (
      req.query.marketType &&
      !Object.values(MarketType).includes(req.query.marketType as MarketType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid marketType filter",
        data: null,
        pagination: null,
      });
    }

    const symbolQuery = req.query.symbol;
    // Validate that if symbol is provided, it is a string
    if (symbolQuery !== undefined && typeof symbolQuery !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid symbol filter",
        data: null,
        pagination: null,
      });
    }
    const symbol = symbolQuery?.trim().toUpperCase();
    // Validate that if symbol is provided, it is not empty
    if (symbolQuery !== undefined && !symbol) {
      return res.status(400).json({
        success: false,
        message: "Symbol filter cannot be empty",
        data: null,
        pagination: null,
      });
    }
    // Validate tradeType filter
    if (
      req.query.tradeType &&
      !Object.values(TradeType).includes(req.query.tradeType as TradeType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid tradeType filter",
        data: null,
        pagination: null,
      });
    }

    // Validate startDate and endDate
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const startDateQuery = req.query.startDate;
    if (startDateQuery !== undefined && typeof startDateQuery !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate",
        data: null,
        pagination: null,
      });
    }

    if (startDateQuery !== undefined) {
      const parsedStartDate = parseDateOnly(startDateQuery);
      if (parsedStartDate === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
          data: null,
          pagination: null,
        });
      }
      startDate = parsedStartDate;
    }

    const endDateQuery = req.query.endDate;
    if (endDateQuery !== undefined && typeof endDateQuery !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid endDate",
        data: null,
        pagination: null,
      });
    }

    if (endDateQuery !== undefined) {
      const parsedEndDate = parseDateOnly(endDateQuery);
      if (parsedEndDate === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
          data: null,
          pagination: null,
        });
      }
      endDate = parsedEndDate;
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be greater than endDate",
        data: null,
        pagination: null,
      });
    }

    const params = {
      page,
      limit,
      status: req.query.status as TradeStatus | undefined,
      marketType: req.query.marketType as MarketType | undefined,
      symbol,
      tradeType: req.query.tradeType as TradeType | undefined,
      startDate,
      endDate,
    };

    const trades = await getTradesService(params);
    res.status(200).json({
      success: true,
      message: "trades retrieved successfully",
      data: trades.trades,
      pagination: trades.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTradeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tradeId = req.params.id;
    if (typeof tradeId !== "string") {
      return next(new AppError("Invalid trade ID", 400));
    }
    const trade = await getTradeService(tradeId);
    res.status(200).json({
      success: true,
      message: "Trade found successfully",
      data: trade,
      pagination: null,
    });
  } catch (error) {
    next(error);
  }
};
