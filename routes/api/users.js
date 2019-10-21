const express = require('express');
const { check, validationResult } = require('express-validator/check');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')

const router = express.Router();
const User = require('../../models/Users');

// @rote    Post api/users
// @desc    Register user
// @access  Public
router.post("/", [
    check('name', "Name is required.").not().isEmpty(),
    check('email', "Please include a valid email").isEmail(),
    check('password', "Please enater a password with 6 or more charater").isLength({ min: 6 })

],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const { name, email, password } = req.body;
        try {
            // check for user exist
            let user = await User.findOne({ email });
            console.log("user => ", user);
            if (user) {
                return res.status(400).json({
                    errors: [{ msg: "User already exists" }]
                });
            }
            // getting the avatar.
            const avatar = gravatar.url(email, {
                s: "200",
                r: "pg",
                d: "mm"
            });
            // creating a object.
            user = new User({
                name,
                email,
                avatar,
                password
            });
            // using encription to encrypt the password.
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
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
    })

module.exports = router;