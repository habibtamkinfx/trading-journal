import { check } from 'express-validator';
import { MarketType } from '../types/enums/market-type.enum';
import { TradeType } from '../types/enums/trade.type.enum';
import { TradeStatus } from '../types/enums/trade-status.enum';
import { TradeEmotion } from '../types/enums/trade-emotion.enum';

export default new (class {
  tradesValidator() {
    return [
      check('accountId')
        .trim()
        .notEmpty()
        .withMessage('accountId can not be empty')
        .isString()
        .withMessage('accountId must be a string'),
      check('entryPrice')
        .notEmpty()
        .withMessage('Entry price can not be empty')
        .isFloat({ gt: 0 })
        .withMessage('entryPrice must be a number greater than 0'),
      check('quantity')
        .notEmpty()
        .withMessage('quantity can not be empty')
        .isFloat({ gt: 0 })
        .withMessage('quantity must be a number greater than 0'),
      check('marketType')
        .notEmpty()
        .withMessage('marketType can not be empty')
        .isIn(Object.values(MarketType))
        .withMessage(
          `Invalid market type. Allowed values are: ${Object.values(MarketType).join(', ')}`,
        ),
      check('tradeType')
        .notEmpty()
        .withMessage('Trade type is required')
        .isIn(Object.values(TradeType))
        .withMessage(
          `Invalid trade type. Allowed values are: ${Object.values(TradeType).join(', ')}`,
        ),
      check('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(TradeStatus))
        .withMessage(
          `Invalid status. Allowed values are: ${Object.values(TradeStatus).join(', ')}`,
        ),
      check('symbol')
        .trim()
        .notEmpty()
        .withMessage('Symbol is required')
        .isString()
        .withMessage('Symbol must be a string'),
      check('fees')
        .notEmpty()
        .withMessage('Fees is required')
        .isFloat({ min: 0 })
        .withMessage('Fees must be a valid and positive number '),
      check('tradeDate')
        .notEmpty()
        .withMessage('Trade date can not be empty')
        .isISO8601()
        .withMessage('Trade date must be a valid date'),
      check('emotion')
        .optional()
        .isIn(Object.values(TradeEmotion))
        .withMessage(
          `Invalid emotion. Allowed emotions are: ${Object.values(TradeEmotion).join(', ')}`,
        ),
      check('notes')
        .optional()
        .isString()
        .withMessage('Trade note must be a string'),
      check('strategy')
        .optional()
        .isString()
        .withMessage('Trade strategy must be a string'),
      check('takeProfit')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Take profit must be a number and greater than 0'),
      check('stopLoss')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Stop loss must be a number and greater than 0'),
      check('exitDate')
        .custom((value, { req }) => {
          if (req.body.status === 'open' && value != null) {
            throw new Error('Open trades cannot have an exit date');
          }
          return true;
        })
        .if((value, { req }) => req.body.status === 'closed')
        .notEmpty()
        .withMessage('Exit date is required for closed trades')
        .bail()
        .isISO8601()
        .withMessage('Exit date must be a valid date'),
      check('exitPrice')
        .custom((value, { req }) => {
          if (req.body.status === 'open' && value != null) {
            throw new Error('Open trades cannot have an exit price');
          }
          return true;
        })
        .if((value, { req }) => req.body.status === 'closed')
        .notEmpty()
        .withMessage('Exit price is required for closed trades')
        .bail()
        .isFloat({ gt: 0 })
        .withMessage('Exit price must be a number and greater than 0'),
    ];
  }
})();
