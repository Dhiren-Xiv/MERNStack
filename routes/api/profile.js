const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const Post = require('../../models/Posts');
const { check, validationResult } = require('express-validator');

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

// @rote    POST api/profile
// @desc    Create or update a user profile
// @access  Private
router.post("/", [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
]], async (req, res) => {
    // validating the fields.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    // Build profile object;
    const profileFields = {}

    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = (typeof skills === 'string') ?
            skills.split(',').map(skill => skill.trim()) : skills;
    }
    // build social object.
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            // update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            res.json(profile);
        } else {
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
});

// @rote    GET api/profile
// @desc    get all  profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        let profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
});

// @rote    GET api/profile/user/:user_id
// @desc    get all profile by user id 
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {

        let profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            res.status(400).json({ msg: "Profile not found" })
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            res.status(400).json({ msg: "Profile not found" })
        }
        res.status(500).send("Internal Server Error")
    }
});

// @rote    DELETE api/profile
// @desc    Delte profile user & post 
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user Posts.
        await Post.deleteManay({ user: req.user.id });
        // Remove the Profile.
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove the User.
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: "User delete." });
    } catch (error) {
        console.error(error.message);
        if (error.kind == 'ObjectId') {
            res.status(400).json({ msg: "Profile not found" })
        }
        res.status(500).send("Internal Server Error")
    }
});

// @rote    PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, company, location, from, to, current, description } = req.body;
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save()
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// @rote    DELET api/profile/experience/:exp_id
// @desc    Delete profile experience
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // get the removeIndex
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
});

// @rote    PUT api/profile/education
// @desc    Add profile education
// @access  Private

router.put('/education', [auth, [
    check('school', 'Schoool is required').not().isEmpty(),
    check('degree', 'DegreeCompany is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save()
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// @rote    DELET api/profile/education/:edu_id
// @desc    Delete profile education
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // get the removeIndex
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
});
module.exports = router;