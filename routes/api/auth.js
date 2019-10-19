const express = require('express');

const router = express.Router();

// @rote    GET api/auth
// @desc    Test route
// @access  Public
router.get("/", (req, res) => res.send('Auth Route'))

module.exports = router;