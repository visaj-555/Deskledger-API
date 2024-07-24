const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization']; // extract the authorization header
    if (!authHeader) {
        return res.status(403).json({ message: "Token is required" });
    }

    const token = authHeader.split(' ')[1]; //splits the authoriZation header into spaces and take the 2nd part
    if (!token) {
        return res.status(403).json({ message: "Token is required" });
    }
1
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded;
        console.log(decoded);
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token is invalid or expired" });
    }
};

module.exports = {ensureAuthenticated} ;
