import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid trade data',
      data: null,
    });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      data: null,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    data: null,
  });
};

export default errorMiddleware;
