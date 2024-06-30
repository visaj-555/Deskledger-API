//Importing all the modules

const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const fs = require('fs');
const routes = require('./routes/route');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';
const url = process.env.CONNECTION;

//Middleware to Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.json());

app.use('/api', routes);

const databaseConnection = async () => {
    try {
        await mongoose.connect(url);
        console.log('Connected to database');
    } catch (error) {
        console.error('Error while connecting to database:', error);
    }
};

databaseConnection();



app.listen(PORT, () => {
    console.log(`App listening at http://${host}:${PORT}`);
});
