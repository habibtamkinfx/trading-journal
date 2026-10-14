import express from 'express';
const app = express();
import tradeRouter from './routes/trade.routes';

// Middleware
app.use(express.json());

// Routes
app.use('/api/trades', tradeRouter);

export default app;
