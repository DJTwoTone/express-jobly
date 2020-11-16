// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// const app = require('../../app')
// const db = require('../../db');
// const User = require('../../models/user');

// let testData = {}

// beforeEach(async function() {
//     try {
//         const hashedPassword = await bcrypt.hash('password', 1)
//         const testUser = await db.query(
//             `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
//             VALUES ('testuser', $1, 'james', 'kirk', 'captain@nc17.mil', true)
//             RETURNING *`,
//             [hashedPassword]
//         );
//         // console.log(testUser);

//         testData.user = testUser.rows[0];
//         // console.log(testData);

//         const responce = await request(app)
//             .post('/login')
//             .send({
//                 username: 'testuser',
//                 password: 'password'
//             });
//             testData.user.token = responce.body.token;
//             // console.log(testData)

//         const testCompany = await db.query(
//             `INSERT INTO companies (handle, name, num_employees)
//             VALUES ('ufp', 'starfleet', 1000)
//             RETURNING *`
//         );

//         testData.company = testCompany.rows[0];
//         // console.log(testData);

//         const testJob = await db.query(
//             `INSERT INTO jobs (title, salary, equity, company_handle)
//             VALUES ('charismatic captain', 1000000, 0.1, 'ufp')
//             RETURNING *`
//         );

//         testData.job = testJob.rows[0];

//         // console.log(testData);
        
//     } catch (e) {
//         console.error('beforeeach', e)
//     }
// })

//  afterEach(async function() {
//     try {
//         await db.query('DELETE FROM jobs');
//         await db.query('DELETE FROM companies');
//         await db.query('DELETE FROM users');
//         testData = {};
//     } catch (e) {
//         console.error('aftereach', e)
//     }
// })

// afterAll(async function() {
//     try {
//         await db.end();
//     } catch (e) {
//         console.error('afterall', e)
//     }
// })

// describe('test POST routes users', async function() {
//     test('creates a new user', async function() {
//         const userObj = {
//             username: 'numberone',
//             first_name: 'william',
//             last_name: 'riker',
//             password: 'password',
//             email: 'trombone@starfleet.mil'
//         }
//         const responce = await request(app)
//         .post('/users')
//         .send(userObj);
//         expect(responce.statusCode).toBe(201);
//         expect(responce.body).toHaveProperty('token')
//         const will = await User.getUser('numberone');
//         ['username', 'first_name', 'last_name', 'email'].forEach(key => {
//             expect(userObj[key]).toEqual(will[key]);
//         })
//     })

//     test('cannot create user with used username', async function() {
//         const responce = await request(app)
//         .post('/users')
//         .send({
//             username: 'testuser',
//             first_name: 'micheal',
//             last_name: 'burnham',
//             password: 'password',
//             email: 'notvulcan@starfleet.mil'
//         })
//         expect(responce.statusCode).toBe(400)
//     })

//     test('must have password to create user', async function() {
//         const responce = await request(app)
//         .post('/users')
//         .send({
//             username: 'justahuman',
//             first_name: 'data',
//             last_name: 'sihng',
//             email: 'ahuman@starfleet.mil'
//         })
//         expect(responce.statusCode).toBe(400)
//     })
// })

// describe('test GET route users', async function() {
//     test('get use in a list', async function() {
//         const responce = await request(app)
//         .get('/users')
//         .send({ _token: testData.user.token });

//         expect(responce.body.users).toHaveLength(1);
//         expect(responce.body.users[0]).toHaveProperty('username');
//         expect(responce.body.users[0]).not.toHaveProperty('password');
//     })
// })

// describe('test GET route users/:username', async function() {
//     test('get a single user', async function() {
//         const responce = await request(app)
//         .get(`/users/${testData.user.username}`)
//         .send({ _token: testData.user.token })
//         expect(responce.body.user).toHaveProperty('username');
//         expect(responce.body.user).not.toHaveProperty('password');
//         expect(responce.body.user.username).toBe('testuser')
//     })

//     test('404 error if cannot find user', async function() {
//         const responce = await request(app)
//         .get('/users/kkkhhhaaaaannnnn')
//         .send({ _token: testData.user.token} )
//         expect(responce.statusCode).toBe(404)
//     })
// })

// describe("test PATCH route users", async function() {
//     test("update a user's first name", async function() {
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             first_name: 'tiberius',
//             _token: testData.user.token
//         })

//         expect(responce.body.user).toHaveProperty('username');
//         expect(responce.body.user).not.toHaveProperty('password');
//         expect(responce.body.user.first_name).not.toBe('james');
//         expect(responce.body.user.first_name).toBe('tiberius');
//         expect(responce.body.user.username).not.toBe(null);
//     })

//     test("update a user's password", async function() {
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             password: 'qwerty',
//             _token: testData.user.token
//         })

//         expect(responce.body.user).toHaveProperty('username');
//         expect(responce.body.user).not.toHaveProperty('password');
//     })

//     test("not allowed to edit username", async function() {
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             username: 'khaless',
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(400)
//     })

//     test("not allowed to edit admin priveldges", async function() {
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             is_admin: false,
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(400)
//     })

//     test("return error for incorrect data", async function() {
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             ship: 'voyager',
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(400)
//     })

//     test("prevent editing other users info", async function() {
//         const responce = await request(app)
//         .patch(`/users/worf`)
//         .send({
//             password: 'qwerty',
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(401);
//     })



//     test("404 error is cannot find user", async function() {
//         await request(app)
//         .delete(`/users/${testData.user.username}`)
//         .send({ _token: testData.user.token });
//         console.log(testData)
//         const responce = await request(app)
//         .patch(`/users/${testData.user.username}`)
//         .send({
//             password: 'qwerty',
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(404);
//     })
// })

// describe('test DELETE route users', async function() {
//     test('delete a user', async function() {
//         const responce = await request(app)
//         .delete(`/users/${testData.user.username}`)
//         .send({
//             _token: testData.user.token
//         });
//         expect(responce.body).toEqual({ message: `User: ${testData.user.username} deleted`});
//     })

//     test('prevents users from deleting other users', async function() {
//         const responce = await request(app)
//         .delete('/users/harrymudd')
//         .send({
//             _token: testData.user.username
//         });
//         expect(responce.statusCode).toBe(401);
//     })

//     test("404 error is cannot find user", async function() {
//         await request(app)
//         .delete(`/users/${testData.user.username}`)
//         .send({ _token: testData.user.token });
//         console.log(testData)
//         const responce = await request(app)
//         .delete(`/users/${testData.user.username}`)
//         .send({
//             _token: testData.user.token
//         })

//         expect(responce.statusCode).toBe(404);
//     })
// })