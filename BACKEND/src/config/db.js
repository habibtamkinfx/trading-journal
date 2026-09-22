const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tradingjournal').then(() => {
  console.log('mongoose connected');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
})