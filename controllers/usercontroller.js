const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.log("Error while registering user:", error);
        res.status(500).json({ message: "Error registering user", error });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request received for email:", email);

        const user = await UserModel.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match for email:", email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {
            expiresIn: '1h'
        });

        // var generated_token = {token };
        // dbo.collection("customers").insertOne(myobj, function(err, res) {
        //   if (err) throw err;
        //   console.log("1 document inserted");
        //   db.close();
        // });
        
        console.log("Token generated for user:", user._id);
        // Remove password from the user object before sending it in the response
        const { password: userPassword, ...userInfo } = user.toObject();
        
        res.status(200).json({message: "Login Successful", token, user: userInfo });
    } catch (error) {
        console.error("Error while logging in:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await UserModel.findById(userId, { password: 0 });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUser
};
