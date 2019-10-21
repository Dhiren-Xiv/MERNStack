const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {

    //Get the token from header.
    const token = req.header('x-auth-token');
    console.log("token", token);

    // Check if no token.
    if (!token) {
        return res.status(401).json({ msg: "No token, Authorization denied" });
    }

    // Verify token.
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        console.log("decoded", decoded);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token is not valid" })
    }
}