import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { Trade } from './../models/trade.model';
import { validationResult } from 'express-validator';
import tradeValidator from '../validators/trade.validator';
const router = Router();

router.get('/', async (req, res, next) => {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit as string) || 10, 1),
    100,
  );
  const page = Math.max(parseInt(req.query.page as string) || 1, 1);
  try {
    const totalTrades = await Trade.countDocuments();
    const totalPages = Math.ceil(totalTrades / limit);
    if (page > totalPages && totalTrades > 0) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
        data: null,
        pagination: null,
      });
    }
    const trades = await Trade.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({
      success: true,
      message: 'trades retrieved successfully',
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

router.get('/:id', async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({
        success: false,
        message: 'trade not found',
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Trade found successfully',
      data: trade,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  tradeValidator.tradesValidator(),
  async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const messages = result.array().map((err) => err.msg);
      res.status(400).json({
        success: false,
        message: 'Bad request',
        data: messages,
      });
      return;
    }
    try {
      const trade = await Trade.create(req.body);
      res.status(201).json({
        success: true,
        message: 'trade successfully created',
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  },
);
export default router;
