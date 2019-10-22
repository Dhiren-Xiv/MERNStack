const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

// @rote    GET api/profile/me
// @desc    Get Current users profile
// @access  Private
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;