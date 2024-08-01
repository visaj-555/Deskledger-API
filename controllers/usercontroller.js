const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Import axios
const TokenModel = require('../models/tokenModel')
const fs = require('fs');
const path = require('path');
// Registering User
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNo, email, password } = req.body;
    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      firstName,
      lastName,
      phoneNo,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully", data: { ...savedUser.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
      const user = await UserModel.findOne({ email });
      if (!user) {
          return res.status(400).json({ statusCode: 400, message: 'User not found' });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
          return res.status(400).json({ statusCode: 400, message: 'Invalid password' });
      }
      
      const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '1d' });

      // Save the token in the database
      const tokenDoc = new TokenModel({ token });
      await tokenDoc.save();
      
      res.status(200).json({
          statusCode: 200,
          message: 'Login Successful',
          data: {
              token,
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              phoneNo: user.phoneNo,
              email: user.email
          }
      });
  } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
};

// Fetch data from an external API using Axios
const fetchExternalData = async (token) => {
  try {
    const response = await axios.get('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching external data:', error);
    throw error;
  }
};

// Read all the Users Information
const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 });
    res.status(200).json({ statusCode: 200, message: "Users data fetched successfully", data: users });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: "Error fetching users", error });
  }
};

// Read all the User Information by Id
const getUser = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.findById(id, { password: 0 });
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }
    res.status(200).json({ statusCode: 200, message: "User data fetched by Id", data: user });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: "Error fetching user", error });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const { id } = req.params;
    const { firstName, lastName, phoneNo, email } = req.body;

    // Prepare update data
    let updateData = { firstName, lastName, phoneNo, email };

    if (req.file) {
      // Get the original file extension
      const fileExtension = path.extname(req.file.originalname);

      // Create new file name using the firstName and .jpg extension
      const newFileName = `${firstName}.jpg`;

      // Path to the uploaded file
      const oldFilePath = req.file.path;

      // New file path
      const newFilePath = path.join(path.dirname(oldFilePath), newFileName);

      // Rename the file
      fs.renameSync(oldFilePath, newFilePath);

      // Update the image field with the new file name
      updateData.image = newFileName;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'User updated successfully!',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message
    });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({
      statusCode: 200,
      message: 'User deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      message: 'User can\'t be deleted',
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  updateUser,
  getUsers,
  getUser,
  deleteUser,
  loginUser,
  fetchExternalData 
};
