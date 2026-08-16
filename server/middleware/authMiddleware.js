//server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            req.user = decoded;

            next();

        } catch (error) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "No token",
        });
    }
};

const adminOnly = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            message: "Not authorized",
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin only",
        });
    }

    next();
};

module.exports = {
    protect,
    adminOnly,
};