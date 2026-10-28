import express from 'express';
import helmet from 'helmet';
import tradeRouter from './routes/trade.routes';
import errorMiddleware from './middlewares/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/trades', tradeRouter);
app.use(errorMiddleware);

export default app;
