//server/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const transporter = require("../config/nodemailer");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// RATE LIMITERS
// ===============================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: "Too many attempts, please try again later" },
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many OTP attempts, please try again later" },
});

router.get("/profile", protect, async (req, res) => {
    res.json({
        message: "Protected Route Accessed",
        user: req.user,
    });
});

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required",
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/login", authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.get("/me", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.put("/profile", protect, async (req, res) => {
    try {
        const { username } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.username = username || user.username;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.put("/change-password", protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current and new password are required",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        // Invalidate existing sessions so old refresh tokens can't
        // keep minting new access tokens after a password change
        user.refreshToken = null;

        await user.save();

        res.status(200).json({
            message: "Password changed successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.delete("/delete-account", protect, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required to delete account",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password",
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            message: "Account deleted successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/logout", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.refreshToken = null;
        await user.save();

        res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/forgot-password", authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal whether the email exists in the system
            return res.status(200).json({
                message: "If that email is registered, an OTP has been sent",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            html: `
                <h2>Password Reset Request</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP expires in 10 minutes.</p>
            `
        });

        res.status(200).json({
            message: "If that email is registered, an OTP has been sent",
        });

    } catch (error) {
        console.error("EMAIL ERROR:", error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/verify-otp", otpLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                message: "OTP expired",
            });
        }

        res.status(200).json({
            message: "OTP verified successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/reset-password", otpLimiter, async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
            });
        }

        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                message: "OTP expired",
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        // Clear OTP
        user.otp = null;
        user.otpExpire = null;

        // Invalidate existing sessions
        user.refreshToken = null;

        await user.save();

        res.status(200).json({
            message: "Password reset successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong",
        });
    }
});

router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: "No refresh token",
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({
                message: "Invalid refresh token",
            });
        }

        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            accessToken,
        });

    } catch (error) {
        res.status(403).json({
            message: "Invalid or expired refresh token",
        });
    }
});

// ===============================
// ADMIN - GET ALL USERS
// ===============================
router.get(
    "/admin/users",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const users = await User.find().select("-password").lean();

            res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    }
);

// ===============================
// ADMIN - GET USER BY ID
// ===============================
router.get(
    "/admin/users/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
                .select("-password");

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.status(200).json(user);

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    }
);

// ===============================
// ADMIN - CREATE USER
// ===============================
router.post(
    "/admin/users",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const {
                username,
                email,
                password,
                role
            } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({
                    message: "Username, email and password are required",
                });
            }

            const userExists =
                await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({
                    message: "User already exists",
                });
            }

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                role: role || "user",
            });

            res.status(201).json({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    }
);

// ===============================
// ADMIN - UPDATE USER
// ===============================
router.put(
    "/admin/users/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            user.username =
                req.body.username || user.username;

            user.email =
                req.body.email || user.email;

            user.role =
                req.body.role || user.role;

            await user.save();

            res.json({
                message: "User updated successfully",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    }
);

// ===============================
// ADMIN - DELETE USER
// ===============================
router.delete(
    "/admin/users/:id",
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const user =
                await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            await User.findByIdAndDelete(
                req.params.id
            );

            res.status(200).json({
                message: "User deleted successfully",
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    }
);

module.exports = router;