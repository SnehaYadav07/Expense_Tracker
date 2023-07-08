const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const transactions = await Transaction.find({ userId: req.session.userId });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { description, amount, type } = req.body;

  try {
    const newTransaction = new Transaction({
      userId: req.session.userId,
      description,
      amount,
      type,
    });

    await newTransaction.save();

    res.status(201).json({ message: 'Transaction created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    await Transaction.findByIdAndDelete(transactionId);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updatedTransaction = req.body;
    await Transaction.findByIdAndUpdate(transactionId, updatedTransaction);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
};
