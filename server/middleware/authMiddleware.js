const jwt = require("jsonwebtoken");

const JWT_SECRET = "InterviewAISecret123";

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing.",
        });
    }

    const token = authHeader.split(" ")[1];

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