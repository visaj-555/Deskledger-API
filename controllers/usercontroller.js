const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body; // Taking email and password as input from req.body
        console.log("Login request received for email:", email);

        if (!email || !password) { // If email and password are empty 
            console.log("Email or password not provided");
            return res.status(400).json({ statusCode: 400, message: "Email and Password are required" });
        }

        const user = await UserModel.findOne({ email }); // checking if email exists in our database

        if (!user) { 
            console.log("User doesn't exist:", email); // if email doens't exist then send error
            return res.status(400).json({ statusCode: 400, message: "Invalid credentials" });
        }

        if (user.role !== 'admin') { // if the role of user is not admin then send error
            console.log("User is not an admin:", email);
            return res.status(403).json({ statusCode: 403, message: "Access denied" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { // comparing the entererd password and the existing password
            console.log("Password does not match for email:", email);
            return res.status(403).json({ statusCode: 403, message: "Email or Password does not match" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: '1h' // generating jwt token 
        });

        const { password: userPassword, ...userInfo } = user.toObject(); // create object with user information where password is hidden
        res.status(200).json({ statusCode: 200, message: "Login Successful", data: { token ,...userInfo, } }); // sending login success message along with the data



    } catch (error) {
        console.error("Error while logging in:", error); // Sending login error 
        res.status(500).json({ statusCode: 500, message: "Error logging in", error });
    }
};

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNo, role, email, password } = req.body; // Taking all the user information from req.body
        console.log("Request body:", req.body);

        const userExists = await UserModel.findOne({ email });  // Checking if user exists already if it exists then throw error
        if (userExists) {
            return res.status(400).json({ statusCode: 400, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);  
        const hashedPassword = await bcrypt.hash(password, salt); // user’s password is combined with the salt and then passed through a hashing algorithm, such as bcrypt.

        const newUser = new UserModel({
            firstName,
            lastName,
            phoneNo,
            role,
            email,
            password: hashedPassword, // passing all the users information by creating a new object
        });

        const savedUser = await newUser.save();  // save the user's information in the database

        const token = jwt.sign({ id: savedUser._id }, process.env.SECRET, {
            expiresIn: '1h' // generated token which is expiring in 1 hour 
        });

        res.status(201).json({ statusCode: 201,message: "User registered successfully", data: { ...savedUser.toObject(), token } });

    } catch (error) {
        console.log("Error while registering user:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering user", error });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 }); // showing all the users information
        res.status(200).json({ statusCode: 200, data: users });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error fetching users", error });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id; // taking user input id from req.body
        const user = await UserModel.findById(userId, { password: 0 }); // finding user by its id (search)

        if (!user) { // if user not found then throw an error
            return res.status(404).json({ statusCode: 404, message: "User not found" });
        }

        res.status(200).json({ statusCode: 200, data: user }); // returning user's information
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error fetching user", error });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.query.id; // taking user id as input 
        const { firstName, lastName, phoneNo, email } = req.query;

        const updatedUser = await UserModel.findByIdAndUpdate( // Searching id and updating data from finding function
            userId, // taking user id separately
            { firstName, lastName, phoneNo, email }, // all the user fields
            { new: true } 
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        } // if the user id is not found then throw an error

        res.status(200).json({
            statusCode: 200, // If the user is updated successfully
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

        const deletedUser = await UserModel.findByIdAndDelete(userId); // Delete user data from database by its ID 

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }  // If Id not found then throw the error

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

module.exports = {
    registerUser,
    loginAdmin,
    updateUser,
    getUsers,
    getUser, 
    deleteUser
};



