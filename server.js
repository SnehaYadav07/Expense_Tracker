const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { connect } = require('mongoose');
const path=require('path')
const { register, login, logout } = require('./controllers/authController');
const {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} = require('./controllers/transactionController');
const connectDB = require('./db/connect');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

// Connect to MongoDB
connectDB();


app.get('*',function(req,res){
  res.sendFile(path.join(__dirname, './client/build/index.html'));
})

app.use(express.static(path.join(__dirname,'./client/build')));

// Routes
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);
app.get('/transactions', getTransactions);
app.post('/transactions', createTransaction);
app.delete('/transactions/:id', deleteTransaction);
app.put('/transactions/:id', updateTransaction);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
