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
import { tradesValidator, tradeUpdateValidator } from "../validators";
import { parseDateOnly } from "../utils";
import { createTradeController } from "../controllers";
const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
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

  try {
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

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
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

router.post("/", tradesValidator(), createTradeController);

router.patch(
  "/:id",
  tradeUpdateValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
    // Define fields allowed for update
    const allowedFields = [
      "marketType",
      "symbol",
      "entryPrice",
      "exitPrice",
      "quantity",
      "stopLoss",
      "takeProfit",
      "fees",
      "strategy",
      "status",
      "tradeDate",
      "exitDate",
      "tradeType",
      "emotion",
      "notes",
    ];

    try {
      const data = req.body;
      const id = req.params.id;

      // Ensure the request body is a valid object
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          message: "Request body must be a valid object",
          data: null,
          pagination: null,
        });
      }
      // Prevent empty update requests
      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No data provided for update",
          data: null,
          pagination: null,
        });
      }
      // Prevent updating restricted fields
      if (
        Object.keys(data).some((key) =>
          ["accountId", "_id", "createdAt", "updatedAt"].includes(key),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "One or more fields cannot be updated",
          data: null,
          pagination: null,
        });
      }
      // Reject unsupported fields
      if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
        return res.status(400).json({
          success: false,
          message: "One or more fields are invalid for update",
          data: null,
          pagination: null,
        });
      }

      // Check validation errors
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
      // Retrieve existing trade
      const existingTrade = await Trade.findById(id);
      if (!existingTrade) {
        return res.status(404).json({
          success: false,
          message: "Trade not found",
          data: null,
          pagination: null,
        });
      }

      // Determine the resulting trade values after applying the requested changes
      const updatedStatus = data.status ?? existingTrade.status;
      const updatedExitPrice =
        data.exitPrice !== undefined ? data.exitPrice : existingTrade.exitPrice;
      const updatedExitDate =
        data.exitDate !== undefined ? data.exitDate : existingTrade.exitDate;

      // Ensure open trades do not contain exit information
      if (
        updatedStatus === TradeStatus.OPEN &&
        (updatedExitPrice != null || updatedExitDate != null)
      ) {
        return res.status(400).json({
          success: false,
          message: "Open trades cannot have an exit price or exit date",
          data: null,
          pagination: null,
        });
      }

      // Ensure closed trades have both exit price and exit date
      if (
        updatedStatus === TradeStatus.CLOSED &&
        (updatedExitPrice == null || updatedExitDate == null)
      ) {
        return res.status(400).json({
          success: false,
          message: "Closed trades must have an exit price and exit date",
          data: null,
          pagination: null,
        });
      }

      // Apply the updates and return the updated trade document
      const trade = await Trade.findByIdAndUpdate(
        id,
        { $set: data },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );
      // Handle the case where the trade no longer exists
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: "Trade not found",
          data: null,
          pagination: null,
        });
      }
      res.status(200).json({
        success: true,
        message: "Trade updated successfully",
        data: trade,
        pagination: null,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const trade = await Trade.findByIdAndDelete(id);
      if (!trade) {
        return res.status(404).json({
          success: false,
          message: "Trade not found",
          data: null,
          pagination: null,
        });
      }
      res.status(200).json({
        success: true,
        message: "Trade deleted successfully",
        data: trade,
        pagination: null,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
