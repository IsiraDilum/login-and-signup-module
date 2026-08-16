//server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        default: null,
    },

    googleId: {
        type: String,
        default: null,
    },

    provider: {
        type: String,
        default: "local",
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    refreshToken: {
        type: String,
        default: null,
    },

    otp: {
        type: String,
        default: null,
    },

    otpExpire: {
        type: Date,
        default: null,
    }
});

module.exports = mongoose.model("User", userSchema);