const express = require('express'); // to create a server
const dotenv = require('dotenv'); // to load .env  variables
const mongoose = require('mongoose'); // to connect to MongoDB
const cors = require('cors'); // Cross origin Resource Sharing
const cookieParser = require('cookie-parser'); // to parse cookies
const routes = require('./routes/route'); // route path 
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config(); // load env variables from .env file

// Setting up express app 
const app = express(); 
const PORT = process.env.PORT || 3500;
const HOST = process.env.HOST ? process.env.HOST.trim() : '192.168.29.16';
const DB_CONNECTION = process.env.CONNECTION;

app.use(express.json()); // allows app to handle json data 
app.use(express.urlencoded({ extended: true })); // handles URL encoded data 
app.use(cookieParser()); // to read cookies 

const corsOptions = {
  origin: 'http://localhost:3000', // allow request from frontend server
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use('/', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // image path 

// to show the existing image in the browser
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

// database connection
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

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`App listening at http://${HOST}:${PORT}`);
});

