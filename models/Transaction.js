const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: String,
  amount: Number,
  type: {
    type: String,
    enum: ['income', 'expense', 'savings'],
    required: true,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
