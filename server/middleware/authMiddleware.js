const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing.",
        });
    }

    const [scheme, token] = authHeader.split(" ");

if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
        success: false,
        message: "Invalid authorization header.",
    });
}

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
}

module.exports = authMiddleware;