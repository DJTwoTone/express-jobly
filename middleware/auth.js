const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError")

function authUser(req, res, next) {
    try {
        const token = req.body._token;

        jwt.verify(token, SECRET_KEY);
        return next()
    } catch (e) {
        return next(new ExpressError("You could not be authenticated", 401));
    }
}

function authAdmin(req, res, next) {
    try {
        const submittedToken = req.body._token

        let token = jwt.verify(submittedToken, SECRET_KEY);

        if(token.is_admin) {
            return next()
        }

        throw new Error();
    } catch (e) {
        return next(new ExpressError("You do not have administrative privledges", 401))
    }
}

function checkCorrectUser(req, res, next) {
    try {
        const submittedToken = req.body._token;

        let token = jwt.verify(submittedToken, SECRET_KEY);
        console.log(token.username, req.params)
        if (token.username === req.params.username) {
            return next()
        }

        throw new Error();
    } catch (e) {
        return next(new ExpressError("Unauthorized", 401))
    }
}

module.exports = { authUser, authAdmin, checkCorrectUser}