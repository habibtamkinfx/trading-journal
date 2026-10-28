import { NextFunction, Request, Response, Router } from 'express';
import { Trade } from './../models/trade.model';
import { validationResult } from 'express-validator';
import tradeValidator from '../validators/trade.validator';
const router = Router();

router.get('/', async (req, res) => {
  const trades = await Trade.find();
  res.status(200).json({
    data: trades,
    message: 'trades successfully find',
  });
});

router.get('/:id', async (req, res) => {
  const trade = await Trade.findById(req.params.id);
  res.status(200).json({
    data: trade,
    message: 'trade successfully find',
  });
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
      res
        .status(201)
        .json({
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
