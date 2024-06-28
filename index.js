const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const host = process.env.HOST;
const url = process.env.CONNECTION;
const PORT = process.env.PORT;
const mongoose = require("mongoose");
const fs = require("fs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const routes = require("./routes/route");
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use('/api/v1', routes)
// const cron = require("node-cron");

// create public directory if don't exist
const directory = "./Public";
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}
app.use("/Public", express.static("Public"));
app.use("/", routes);

// cron job for sending notification.


app.listen(PORT, () => {
  console.log("App listening at :", PORT);
});

//=================== DATABASE CONNECTION ===================//
const databaseconnection = async () => {
  try {
    await mongoose
      .connect(url, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((result) => {
        if (result) {
          console.log("connected to database");
        } else {
          console.log("couldn't connect to database");
        }
      })
      .catch((error) => {
        console.log("error while database connection:", error);
      });
  } catch (error) {
    return console.log("error while connecting to databse::", error);
  }
};

databaseconnection();