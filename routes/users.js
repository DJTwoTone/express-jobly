//defining the user routes for the Jobly app

const express = require('express');
const ExpressError = require('../helpers/expressError')
const User = require('../models/user')
const jsonschema = require('jsonschema');
const { newUserSchema, updateUserSchema } = require('../schemas')
const createToken = require('../helpers/authToken');
const { checkCorrectUser } = require('../middleware/auth')

const router = express.Router()


// GET /users
// This should return JSON: {users: [{username, first_name, last_name, email}, ...]}

router.get('/', async function (req, res, next) {
    try {
        const users = await User.getAllUsers();
        return res.json({ users })
    } catch (e) {
        return next(e)
    }
})

// GET /users/[username]
// This should return JSON: {user: {username, first_name, last_name, email, photo_url}}

router.get('/:username', async function (req, res, next) {
    try {
        const user = await User.getUser(req.params.username);
        return res.json({ user })
    } catch (e) {
        return next(e)
    }
})

// POST /users
// This should return JSON: {user: user}

router.post('/', async function(req, res, next) {
    try {
        //validates that new users have the required info
        const validation = jsonschema.validate(req.body, newUserSchema);

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const user = await User.register(req.body);
        //creates a token for the user
        const token = createToken(user);
        return res.status(201).json({ token })
    } catch (e) {
        return next(e)
    }
})

// PATCH /users/[username]
// This should return JSON: {user: {username, first_name, last_name, email, photo_url}}

router.patch('/:username', checkCorrectUser, async function (req, res, next) {
    try {
        //makes sure the user isn't trying to change their username
        if ('username' in req.body) {
            throw new ExpressError('You are not allowed to change your username', 400);
        }

        //makes sure that the user cannot change their admin privledges
        if ('is_admin' in req.body) {
            throw new ExpressError('You may not change administrative privledges', 400)
        }

        //validates that changes user info is correct
        const validation = jsonschema.validate(req.body, updateUserSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user })
    } catch (e) {
        return next(e)
    }
})

// DELETE /users/[username]
// This should return JSON: { message: "User deleted" }

router.delete('/:username', checkCorrectUser, async function (req, res, next) {
    try {
        const username = req.params.username;
        await User.delete(username);
        return res.json({ message: `User: ${username} deleted` })
    } catch (e) {
        return next(e)
    }
})


module.exports = router;