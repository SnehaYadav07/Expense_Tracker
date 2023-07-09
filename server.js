// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');

require('dotenv').config();


// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log('MongoDB Connected');

// Define User schema
const UserSchema = new mongoose.Schema({
  username: String,
  email:String,
  password: String,
});

// Define Transaction schema
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




// Create User and Transaction models
const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'process.env.secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// Register route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  // Save the user to the database
  await newUser.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Set the user ID in the session
  req.session.userId = user._id;

  res.json({ message: 'Login successful' });
});

// Logout route
app.use(session({
  secret: 'Sneha@123',
  resave: false,
  saveUninitialized: true,
}));

// Logout route
app.post('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred while logging out' });
    } else {
      res.status(200).json({ message: 'Logged out successfully' });
    }
  });
});


// Transaction route - fetch user's transactions
app.get('/transactions', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Fetch transactions for the logged-in user
  const transactions = await Transaction.find({ userId: req.session.userId });

  res.json(transactions);
});

// Transaction route - create a new transaction
app.post('/transactions', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { description, amount, type } = req.body;

  // Create a new transaction associated with the logged-in user
  const newTransaction = new Transaction({
    userId: req.session.userId,
    description,
    amount,
    type,
  });

  // Save the transaction to the database
  await newTransaction.save();

  res.status(201).json({ message: 'Transaction created successfully' });
});


// Delete transaction
app.delete('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    await Transaction.findByIdAndDelete(transactionId);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction
app.put('/transactions/:id', async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updatedTransaction = req.body;
    await Transaction.findByIdAndUpdate(transactionId, updatedTransaction);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


//serving the frontend
app.use(express.static(path.join(__dirname, './client/build')));
app.get("*", function (req,res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});


const PORT=process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => {
  console.log('Server started on port 5000');
});