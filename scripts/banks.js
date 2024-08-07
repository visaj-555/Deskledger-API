const mongoose = require('mongoose');
const BankModel = require('../models/bank'); // Ensure this path is correct

// List of all banks
const banks = [
  { bankName: "Bank of Baroda" },
  { bankName: "Bank of India" },
  { bankName: "Canara Bank" },
  { bankName: "Central Bank of India" },
  { bankName: "State Bank of India" },
  { bankName: "Punjab National Bank" },
  { bankName: "Axis Bank" },
  { bankName: "HDFC Bank" },
  { bankName: "ICICI Bank" },
  { bankName: "IDFC Bank" },
  { bankName: "Kotak Mahindra Bank" },
  { bankName: "IDBI Bank" },
];

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/bankdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Remove existing banks to avoid duplication
    await BankModel.deleteMany({});

    // Insert banks
    await BankModel.insertMany(banks);

    console.log('Banks inserted successfully');

    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
