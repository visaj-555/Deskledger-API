//authValidator.js

const jwt = require("jsonwebtoken"); // to verify jwt tokens
const TokenModel = require("../models/tokenModel"); // a mongodb model to find tokens in db
const { statusCode, message } = require('../utils/api.response'); // import status code and messages
const UserModel = require('../models/userModel');

const ensureAuthenticated = async (req, res, next) => {
    try {
        const bearheader = req.headers["authorization"];
        if (!bearheader) {
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.expiredToken });
        } // authorization header check 

        const token = bearheader.split(" ")[1]; // token extraction

        const is_user = await TokenModel.findOne({ token });
        if (!is_user) { // token existence check in db 
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.tokenNotFound });
        } // token verification

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            req.user = { id: decoded.id }; 
            // Ensure req.user is set with the correct property
            next(); // Error handling
        } catch (err) { 
            console.error("Token verification failed:", err);
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.tokenVerifyFail });
        }
    } catch (error) {
        console.log("Error in ensureAuthenticated:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorFetchingUser });
    }
};

const ensureAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId);

        if (!user || !user.is_admin) {
            console.log("User is not an admin or does not exist");
            return res.status(statusCode.FORBIDDEN).json({ message: message.adminAccessRequired });
        }

        next();
    } catch (error) {
        console.error("Error in ensureAdmin:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorCheckingAdminStatus, error: error.message });
    }
};

module.exports = { ensureAuthenticated, ensureAdmin };
