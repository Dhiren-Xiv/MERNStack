const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');


const User = require('../../models/Users');
// @rote    GET api/auth
// @desc    Test route
// @access  Public
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @rote    Post api/auth
// @desc    Authenticate user and get token.
// @access  Public
router.post("/", [
    check('email', "Please include a valid email").isEmail(),
    check('password', "Password is Require").exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { email, password } = req.body;
    try {
        // check for user exist
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                errors: [{ msg: "Invalid credentials" }]
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ msg: "Invalid credentials" }]
            });
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (error, token) => {
                if (error) throw error;
                res.status(200).json({ token });
            }
        );
        // res.send('User Route');
    } catch (error) {
        console.error(error.message)
        return res.status(500).send("Something went wrong");
    }
});

module.exports = router;