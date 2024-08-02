const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/route'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;
const host = process.env.HOST || '192.168.29.168';
const url = process.env.CONNECTION;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use('/', routes);

const databaseConnection = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');
  } catch (error) {
    console.error('Error while connecting to database:', error);
    process.exit(1); 
  }
};

databaseConnection();

app.listen(PORT, () => {
  console.log(`App listening at http://${host}:${PORT}`);
});
