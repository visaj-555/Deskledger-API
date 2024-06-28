const mongoose = require("mongoose");


const dotenv= require('dotenv')
dotenv.config()
const url = process.env.MONGO_URL;
console.log(url)

mongoose.connect(url)
.then(() => {

    console.log("Connected to MongoDB......."); 
}).catch((err) => {
    console.log("Error while creating MongoDB connect", err);
});

