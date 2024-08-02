const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); 
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

//Login user 
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
      if (req.fileValidationError) {
          return res.status(400).json({ message: req.fileValidationError });
      }

      if (!req.file) {
          return res.status(400).json({ message: 'Please upload a valid image file.' });
      }

      if (req.fileSizeLimitError) {
          return res.status(400).json({ message: 'File size should be less than 1 MB.' });
      }

      const { firstName, lastName, phoneNo, email } = req.body;
      const profileImage = req.file.path; // Path of uploaded image

      const user = await UserModel.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phoneNo = phoneNo || user.phoneNo;
      user.email = email || user.email;
      user.profileImage = profileImage; 

      await user.save();

      // Respond with success message
      res.status(200).json({
          message: 'Profile updated successfully',
          user: {
              firstName: user.firstName,
              lastName: user.lastName,
              phoneNo: user.phoneNo,
              email: user.email,
              profileImage: user.profileImage,
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while updating the profile.' });
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

// Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ statusCode: 400, message: "Invalid old password" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ statusCode: 400, message: "Passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await TokenModel.deleteMany({ userId: userId });

    res.status(200).json({ statusCode: 200, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: "Your password cannot be changed" });
  }
};

module.exports = {
  registerUser,
  updateUser,
  getUsers,
  getUser,
  deleteUser,
  loginUser,
  changePassword 
};
