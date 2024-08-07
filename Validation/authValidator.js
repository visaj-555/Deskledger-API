//authValidator.js

const jwt = require("jsonwebtoken");
const TokenModel = require("../models/tokenModel");
const { statusCode, message } = require('../utils/api.response');

const ensureAuthenticated = async (req, res, next) => {
    try {
        const bearheader = req.headers["authorization"];
        if (!bearheader) {
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.expiredToken });
        }

        const token = bearheader.split(" ")[1];
        console.log("Token received:", token);

        const is_user = await TokenModel.findOne({ token });
        if (!is_user) {
            console.log("Token not found in database");
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.tokenNotFound });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            console.log("Decoded token:", decoded);
            req.user = { id: decoded.id }; // Ensure req.user is set with the correct property
            next();
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(statusCode.UNAUTHORIZED).json({ statusCode: statusCode.UNAUTHORIZED, message: message.tokenVerifyFail });
        }
    } catch (error) {
        console.log("Error in ensureAuthenticated:", error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorFetchingUser });
    }
};

module.exports = { ensureAuthenticated };
