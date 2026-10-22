import { Router } from 'express';
const router = Router();
import { Trade } from '../models/trade.model';

router.get('/', (req, res) => {
  res.send('Hello World');
});

router.post('/', async(req,res)=>{
  const trade = await Trade.create()
})
export default router;
