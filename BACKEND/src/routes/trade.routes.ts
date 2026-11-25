import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Trade } from "./../models/trade.model";
import { TradeStatus } from "../types/enums/trade-status.enum";
import { validationResult } from "express-validator";
import { tradesValidator, tradeUpdateValidator } from "../validators";
import { createTradeController, getTradesController } from "../controllers";

const router = Router();

router.get("/", getTradesController);

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
