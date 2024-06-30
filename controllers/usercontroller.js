const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs'); // for hashing and comparing passwords
const jwt = require('jsonwebtoken');  // for creating and verifying JSON Web Tokens (JWTs).

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, phoneNo, email, password } = req.body; // inputs
        
        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });  // if user(email) already exists
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); // for encryption 

        const newUser = new UserModel({
            firstName,
            lastName,
            phoneNo,
            email,           // creating new user
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);  // save new user
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;  // extract email and password

        const user = await UserModel.findOne({ email });
        if (!user) {            
            return res.status(400).json({ message: "Invalid credentials" }); // check if email exists
        }

        const isMatch = await bcrypt.compare(password, user.password); // comparing passwords
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, {  // Generated token
            expiresIn: '1h'                             // expires in 1 hour
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers
};
