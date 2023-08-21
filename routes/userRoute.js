const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../model/userModel");
const { blacklistModel } = require("../model/blacklistModel");
const userRoute = express.Router();
require("dotenv").config();


userRoute.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (user) {
            return res.status(200).json({ msg: "User already exist, please login" })
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            } else {
                const newUser = new userModel({ ...req.body, password: hash });
                await newUser.save();
                res.status(200).json({ msg: "user registered", user: req.body })
            }
        })
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})


userRoute.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (user) {
            bcrypt.compare(password, user.password, async (err, result) => {
                if (result) {
                    const token = jwt.sign({ userId: user._id, userName: user.name }, process.env.SecretKey,{expiresIn:"7d"});
                    return res.status(200).json({ msg: "login successful", token });
                } else {
                    return res.status(400).json({ error: "wrong credentials" });
                }
            })
        } else {
            return res.status(400).json({ error: "user not exist" });
        }
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

userRoute.get("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            await blacklistModel.updateMany({}, { $push: { blacklist: [token] } });
            return res.status(200).json({ msg: "logout successful" });
        }
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
})

module.exports = { userRoute };