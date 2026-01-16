const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async(req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
        {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/login', async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
        {
            return res.status(404).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword)
        {
            return res.status(400).json({ message: "Wrong Password"});
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            "SecretKey123",
            { expiresIn: "5d" }
        );

        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, token });
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;