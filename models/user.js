//defines a User class for the Jobly app

const db = require("../db");
const bcrypt = require("bcrypt");
const partialUpdate = require("../helpers/partialUpdate")
const ExpressError = require("../helpers/expressError");

//this work factor can be increased to increase password hashes
const BCRYPT_WORK_FACTOR = 12;

class User {

    //creates a function for users to register
    static async register(data) {
        const { username, password, first_name, last_name, email, photo_url} = data;

        //checks that a user's choosen user name isn't already in use
        const nameCheck = await db.query(
            `SELECT username
            FROM users
            WHERE username = $1`, [username]
        );


        if (nameCheck.rows[0]) {
            throw new ExpressError(`Sorry, but "${username}" is already being used. Please select a different username`, 400);
        }

        //makes the password hash to be saved in the database rather than password itself
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        //inserts the user into the database
        const result = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, password, first_name, last_name, email, photo_url`,
            [username, hashedPassword, first_name, last_name, email, photo_url]
        );

        return result.rows[0];
    }

    //creates a function to get a list of all users
    static async getAllUsers() {
        const results = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
            FROM users
            ORDER BY username`
        );

        return results.rows;
    }

    //creates a function to get a single user from the database
    static async getUser(username) {
        const result = await db.query(
            `SELECT username, first_name, last_name, email, photo_url
            FROM users
            WHERE username = $1`, [username]
        )

        const user = result.rows[0];

        if (!user) {
            throw new ExpressError(`User: ${username} does not exist.`, 404)
        }

        return user;
    }

    //creates a function to allow user to update their info in the database
    static async update(username, data) {

        //if password is being changed, makes a new hash to be saved in the database
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        //creates a query for updating the users info
        let { query, values } = partialUpdate("users", data, "username", username);

        const result = await db.query(query, values);
        const user = result.rows[0]

        //returns error for non-existant users
        if (!user) {
            throw new ExpressError(`User: ${username} does not exist.`, 404)
        }

        //deletes sensitive info
        delete user.password;
        delete user.is_admin;

        return result.rows[0]
    }

    //creates a function for deleting users
    static async delete(username) {
        let result = await db.query(
            `DELETE FROM users
            WHERE username = $1
            RETURNING username`, [username]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`User: ${username} does not exist.`, 404);
        }
    }

    //creates a function for authenticating users
    static async authenticate(data) {
        const result = await db.query(
            `SELECT username, password, first_name, last_name, email, photo_url, is_admin
            FROM users
            WHERE username = $1`, [data.username]
        );

        const user = result.rows[0]

        //checking that the password is correct
        if (user) {
            const isValid = await bcrypt.compare(data.password, user.password);
            if (isValid) {
                return user;
            }
        }

        throw new ExpressError("Invalid Password", 401)
    }

}

module.exports = User;