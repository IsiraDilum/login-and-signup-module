//server/config/nodemailer.js
require("dotenv").config();

const nodemailer = require("nodemailer");

//console.log("NODEMAILER USER =", process.env.EMAIL_USER);
//console.log("NODEMAILER PASS =", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("NODEMAILER ERROR:", error);
    } else {
        console.log("NODEMAILER READY");
    }
});

module.exports = transporter;