// defining the login route for the jobly app

const express = require("express");
const User = require('../models/user');
const router = new express.Router();
const createToken = require("../helpers/authToken");

router.post("/login", async function (req, res, next) {
    try {
        //authenticates the user and creates a token for the user to use for accessing other routes
        const user = await User.authenticate(req.body);
        const token = createToken(user)
        return res.json({ token })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;