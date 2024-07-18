// Importing all the modules
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const routes = require('./routes/route');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3500;
const host = process.env.HOST || 'localhost';
const url = process.env.CONNECTION;

// Middleware to Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: 'http://localhost:3000', // your Next.js app URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handling preflight OPTIONS request
app.options('*', cors());

app.use('/', routes);

const databaseConnection = async () => {
  try {
    await mongoose.connect(url); // Remove useNewUrlParser and useUnifiedTopology
    console.log('Connected to database');
  } catch (error) {
    console.error('Error while connecting to database:', error);
    process.exit(1); // Exit process on connection failure
  }
};

databaseConnection();

app.listen(PORT, () => {
  console.log(`App listening at http://${host}:${PORT}`);
});
