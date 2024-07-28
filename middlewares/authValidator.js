//authValidator.js

const jwt = require("jsonwebtoken");
const TokenModel = require("../models/tokenModel");

const ensureAuthenticated = async (req, res, next) => {
    try {
        const bearheader = req.headers["authorization"];
        if (!bearheader) {
            return res.status(401).json({ statusCode: 401, message: "Unauthorized. No token provided." });
        }

        const token = bearheader.split(" ")[1];
        console.log("Token received:", token);

        const is_user = await TokenModel.findOne({ token });
        if (!is_user) {
            console.log("Token not found in database");
            return res.status(401).json({ statusCode: 401, message: "Unauthorized. Token not found." });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET);
            console.log("Decoded token:", decoded);
            req.user = { id: decoded.id }; // Ensure req.user is set with the correct property
            next();
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ statusCode: 401, message: "Unauthorized. Invalid token." });
        }
    } catch (error) {
        console.log("Error in ensureAuthenticated:", error);
        return res.status(500).json({ statusCode: 500, message: "Internal server error." });
    }
};

module.exports = { ensureAuthenticated };
