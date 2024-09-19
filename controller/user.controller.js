const User = require("../models/user.model");
const SECRET_KEY = process.env.JWT_SECRET;
require("dotenv").config();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


/************************************************************
 * @descriptio generating random string
 ***********************************************************/
const generateRandomString = (length) => {
    const characters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
};

/************************************************************
 * @signin
 * @route http://localhost:5000/user/signin
 * @description User Login
 * @returns user object and Token
 ***********************************************************/
const signIn = async(req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(401).json({ message: "All fields are required." });
        }
        if (username == 'Admin' && password == 'Admin123') {
            return res.status(200).json({ message: "User login successful." });
        } else {
            // Return authentication failure message
            return res.status(401).json({ message: "Invalid user credentials." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing in. Please try again." });
    }
};

/************************************************************
 * @signOut
 * @route http://localhost:5000/user/signout
 * @description User Logout
 ***********************************************************/
const signOut = (req, res) => {
    res.json({ message: "You are now signed out" });
};

module.exports = {
    signIn,
    signOut,
};