
const express = require('express');
const ExpressError = require('../helpers/expressError')
const User = require('../models/user')
const jsonschema = require('jsonschema');
const { newUserSchema, updateUserSchema } = require('../schemas')
const createToken = require('../helpers/authToken');
const { checkCorrectUser } = require('../middleware/auth')

const router = express.Router()


// GET /users
// This should return the username, first_name, last_name and email of the user objects.

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
// This should return all the fields for a user excluding the password.

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
// This should create a new user and return information on the newly created user.

// This should return JSON: {user: user}

router.post('/', async function(req, res, next) {
    try {
        const validation = jsonschema.validate(req.body, newUserSchema);

        if (!validation.vaild) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const user = await User.register(req.body);
        const token = createToken(user);
        return res.status(201).json({ token })
    } catch (e) {
        return next(e)
    }
})

// PATCH /users/[username]
// This should update an existing user and return the updated user excluding the password.

// This should return JSON: {user: {username, first_name, last_name, email, photo_url}}

router.patch('/:username', checkCorrectUser, async function (req, res, next) {
    try {
        if ('username' in req.body) {
            throw new ExpressError('You are not allowed to change your username', 400);
        }

        if ('is_admin' in req.body) {
            throw new ExpressError('You may not change administrative provledges', 400)
        }

        const validation = validate(req.body, updateUserSchema);
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
// This should remove an existing user and return a message.

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