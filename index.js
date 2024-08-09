const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/route'); 
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;
const HOST = process.env.HOST ? process.env.HOST.trim() : '192.168.29.168';
const DB_CONNECTION = process.env.CONNECTION;

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  fs.access(filepath, fs.constants.F_OK, (err) => {
      if (err) {
          return res.status(404).send('File not found');
      }

      res.sendFile(filepath);
  });
});

const databaseConnection = async () => {
  try {
    await mongoose.connect(DB_CONNECTION);
    console.log('Connected to database');
  } catch (error) {
    console.error('Error while connecting to database:', error);
    process.exit(1); 
  }
};

databaseConnection();

app.listen(PORT, HOST, () => {
  console.log(`App listening at http://${HOST}:${PORT}`);
});

