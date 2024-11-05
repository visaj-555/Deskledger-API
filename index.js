const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");
const MainRoutes = require("./routes/routeManager"); // Import the routes
const cron = require("node-cron");
const { updateFdData } = require("./controllers/fdcontroller");
const { updateGoldData } = require("./controllers/goldController");
const { updateRealEstateData } = require("./controllers/realEstateController");

// Load environment variables from .env file
dotenv.config();

// Setting up express app
const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3500;
const HOST = process.env.HOST ? process.env.HOST.trim() : "192.168.29.25";
const DB_CONNECTION = process.env.CONNECTION;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ids"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Cron job running at 12 AM");

    await updateFdData();
    await updateGoldData();
    await updateRealEstateData();

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

MainRoutes.forEach((route) => {
  app.use("/", route);
});

app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "uploads", filename);

  fs.access(filepath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("File not found");
    }
    res.sendFile(filepath);
  });
});

// Database connection
const databaseConnection = async () => {
  try {
    await mongoose.connect(DB_CONNECTION);
    console.log("Connected to database");
  } catch (error) {
    console.error("Error while connecting to database:", error);
    process.exit(1);
  }
};

databaseConnection();

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`App listening at http://${HOST}:${PORT}`);
});
