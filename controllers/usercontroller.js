const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNo, email, password } = req.body;
        console.log("Request body:", req.body);
        console.log(firstName);
        console.log(lastName);

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ statusCode: 400, message: "User already exists" });
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


        console.log(newUser);
        const savedUser = await newUser.save();

        const token = jwt.sign({ id: savedUser._id }, process.env.SECRET, {
            expiresIn: '1h'
        });

        res.status(201).json({ statusCode: 201, message: "User registered successfully", data: { ...savedUser.toObject(), token } });
    } catch (error) {
        console.log("Error while registering user:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering user", error });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 });
        res.status(200).json({ statusCode: 200, data: users });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error fetching users", error });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId, { password: 0 });

        if (!user) {
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        res.status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error fetching user", error });
    }
};

const updateUser = async (req, res) => {
    try {
        const {userId, firstName, lastName, phoneNo, email } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { firstName, lastName, phoneNo, email },
            { new: true }
        );

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
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.query.id;

        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            statusCode: 200,
            message: 'User deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request received for email:", email);

        if (!email || !password) {
            console.log("Email or password not provided");
            return res.status(400).json({ statusCode: 400, message: "Email and Password are required" });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log("User doesn't exist:", email);
            return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
        }

      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match for email:", email);
            return res.status(403).json({ statusCode: 403, message: "Email or Password does not match" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: '1h'
        });

        const { password: userPassword, ...userInfo } = user.toObject();
        res.status(200).json({ statusCode: 200, message: "Login Successful", data: { token, ...userInfo } });
    } catch (error) {
        console.error("Error while logging in:", error);
        res.status(500).json({ statusCode: 500, message: "Error logging in", error });
    }
};


module.exports = {
    registerUser,
    updateUser,
    getUsers,
    getUser,
    deleteUser,
    loginUser
};
