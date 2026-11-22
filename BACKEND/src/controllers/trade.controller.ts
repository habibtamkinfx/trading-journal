import {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { validationResult } from "express-validator";
import { createTradeService } from "../services";
import type { ITrade } from "../types/trade/trade.types";

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
