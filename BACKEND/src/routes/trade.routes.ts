import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Trade } from "./../models/trade.model";
import { TradeStatus } from "../types/enums/trade-status.enum";
import { MarketType } from "../types/enums/market-type.enum";
import { TradeType } from "../types/enums/trade.type.enum";
import { validationResult } from "express-validator";
import tradeValidator from "../validators/trade.validator";
const router = Router();

router.get("/", async (req, res, next) => {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 10, 1),
    100,
  );
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  try {
    // Validate status filter
    if (
      req.query.status &&
      !["open", "closed"].includes(req.query.status as string)
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
      startDate = new Date(startDateQuery);
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
          data: null,
          pagination: null,
        });
      }
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
      endDate = new Date(endDateQuery);
      if (Number.isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
          data: null,
          pagination: null,
        });
      }
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate cannot be greater than endDate",
        data: null,
        pagination: null,
      });
    }

    // Adjust endDate to include the entire day
    if (endDate) {
      endDate.setUTCDate(endDate.getUTCDate() + 1);
    }

    const status = req.query.status as TradeStatus | undefined;
    const marketType = req.query.marketType as MarketType | undefined;
    const tradeType = req.query.tradeType as TradeType | undefined;

    const dateFilter =
      startDate || endDate
        ? {
            tradeDate: {
              ...(startDate ? { $gte: startDate } : {}),
              ...(endDate ? { $lt: endDate } : {}),
            },
          }
        : {};

    const filter = {
      ...(status ? { status } : {}),
      ...(marketType ? { marketType } : {}),
      ...(symbol ? { symbol } : {}),
      ...(tradeType ? { tradeType } : {}),
    };

    const combinedFilter = { ...filter, ...dateFilter };

    const totalTrades = await Trade.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalTrades / limit);
    // Validate that the requested page is not greater than the total number of pages
    if (page > totalPages && totalTrades > 0) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
        data: null,
        pagination: null,
      });
    }

    const trades = await Trade.find(combinedFilter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: "trades retrieved successfully",
      data: trades,
      pagination: {
        totalTrades,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "trade not found",
        data: null,
        pagination: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "Trade found successfully",
      data: trade,
      pagination: null,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  tradeValidator.tradesValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
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
      const trade = await Trade.create(req.body);
      res.status(201).json({
        success: true,
        message: "trade successfully created",
        data: trade,
        pagination: null,
      });
    } catch (error) {
      next(error);
    }
  },
);
export default router;
