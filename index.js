//Importing all the modules

const express = require('express'); // using express framework
const app = express();
const dotenv = require('dotenv'); // to load enviroment variables
dotenv.config();
const mongoose = require('mongoose'); // using mongoose framework for nodejs and mongodb connection
const routes = require('./routes/route'); // specifying our route directory
const bodyParser = require('body-parser'); // for parsing all the json responses
const path = require('path');

const PORT = process.env.PORT || 3500; // using port no 3500
const host = process.env.HOST || 'localhost'; // using localhost
const url = process.env.CONNECTION; // fetching connection url link stored in .env file

//Middleware to Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(bodyParser.json());

app.use('/api', routes); // defining our routes


const databaseConnection = async () => { // connecting to the database
    try {
        await mongoose.connect(url); // using mongoose, fetching url from .env
        console.log('Connected to database');
    } catch (error) { // throwing error if not connected
        console.error('Error while connecting to database:', error);
    }
};

databaseConnection(); // calling the function



app.listen(PORT, () => {
    console.log(`App listening at http://${host}:${PORT}`); // logging our port number to know its working
});
