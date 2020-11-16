const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = require('../../app')
const db = require('../../db');
const User = require('../../models/user');

let testData = {}

beforeEach(async function() {
    try {
        const hashedPassword = await bcrypt.hash('password', 1)
        const testUser = await db.query(
            `INSERT INTO users (username, password, first_name, last_name, email, is_admin)
            VALUES ('testuser', $1, 'james', 'kirk', 'captain@nc17.mil', true)
            RETURNING *`,
            [hashedPassword]
        );

        testData.user = testUser.rows[0];

        const responce = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
            testData.user.token = responce.body.token;

        const testCompany = await db.query(
            `INSERT INTO companies (handle, name, num_employees)
            VALUES ('ufp', 'starfleet', 1000)
            RETURNING *`
        );

        testData.company = testCompany.rows[0];

        const testJob = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ('charismatic captain', 1000000, 0.1, 'ufp')
            RETURNING *`
        );

        testData.job = testJob.rows[0];

    } catch (e) {
        console.error('beforeeach', e)
    }
})

 afterEach(async function() {
    try {
        await db.query('DELETE FROM jobs');
        await db.query('DELETE FROM companies');
        await db.query('DELETE FROM users');
        testData = {};
    } catch (e) {
        console.error('aftereach', e)
    }
})

afterAll(async function() {
    try {
        await db.end();
    } catch (e) {
        console.error('afterall', e)
    }
})

describe("test POST routes /jobs", async function() {
    test('create a new job', async function() {
        const responce = await request(app)
        .post('/jobs')
        .send({
            _token: testData.user.token,
            company_handle: testData.company.handle,
            title: "Captian with great interpersonal skills",
            salary: 1000000,
            equity: 0.1
        });
        expect(responce.statusCode).toBe(201);
        expect(responce.body.job).toHaveProperty("id")
    });

    test("cannot create job without title", async function() {
        const responce = await request(app)
        .post("/jobs")
        .send({
            _token: testData.user.token,
            company_handle: testData.company.handle,
            salary: 1000000,
            equity: 0.1
        })
        expect(responce.statusCode).toBe(400)
    });
})

describe("test GET route jobs", async function() {
    test("gets list of job", async function() {
        const responce = await request(app)
        .get('/jobs')
        .send({
            _token: testData.user.token
        })
        const jobs = responce.body.jobs;
        expect(jobs).toHaveLength(1);
        expect(jobs[0]).toHaveProperty("company_handle");
        expect(jobs[0]).toHaveProperty("title")
    });

    test('job search works', async function() {
        const responce = await request(app)
        .get('/jobs?search=charismatic')
        .send({
            _token: testData.user.token
        })
        console.log(responce.body.jobs)
        expect(responce.body.jobs).toHaveLength(1)
        expect(responce.body.jobs[0]).toHaveProperty("company_handle");
        expect(responce.body.jobs[0]).toHaveProperty("title");
    })
})

describe("tests GET route /jobs/:id", async function() {
    test('gets a job by id', async function() {
        console.log(testData)
        const responce = await request(app)
        .get(`/jobs/${testData.job.id}`)
        .send({
            _token: testData.user.token
        })
        console.log("the id i need", responce.body.job.id)
        expect(responce.body.job).toHaveProperty("id");
        expect(responce.body.job.id).toBe(testData.job.id);
    })

    test('returns 404 if job id cannot be found', async function() {
        const responce = await request(app)
        .get('/jobs/1400')
        .send({
            _token: testData.user.token
        })
        expect(responce.statusCode).toBe(404)
    })
})

describe("test PATCH route /jobs/:id", async function() {
    test("update a job's title", async function() {
        const responce = await request(app)
        .patch(`/jobs/${testData.job.id}`)
        .send({
            _token: testData.user.token,
            title: "a failed captain"
        })
        
        expect(responce.body.job).toHaveProperty('id');
        expect(responce.body.job.title).toBe("a failed captain");
        expect(responce.body.job.title).not.toBe("charismatic captain");

    })
    
    test("update a job's equity", async function() {
        const responce = await request(app)
        .patch(`/jobs/${testData.job.id}`)
        .send({
            _token: testData.user.token,
            equity: 0.5
        })
        
        expect(responce.body.job).toHaveProperty('id');
        expect(responce.body.job.equity).toBe(0.5);
        expect(responce.body.job.equity).not.toBe(0.1);

    })

    test("return error for incorrect data", async function() {
        const responce = await request(app)
        .patch(`/jobs/${testData.job.id}`)
        .send({
            _token: testData.user.token,
            race: "human"
        })
        expect(responce.statusCode).toBe(400);
    })

    test("404 error is cannot find user", async function () {
        await request(app)
            .delete(`/jobs/${testData.job.id}`)
            .send({
              _token: testData.user.token
            });
        const response = await request(app)
            .patch(`/jobs/${testData.job.id}`)
            .send({
              _token: testData.user.token, 
              title: "instructor"
            });
        expect(response.statusCode).toBe(404);
      });
})

describe("test DELETE route jobs", async function() {
    test("deletes a job", async function() {
        const responce = await request(app)
        .delete(`/jobs/${testData.job.id}`)
        .send({
            _token: testData.user.token
        });
        expect(responce.body).toEqual({message: `Job #${testData.job.id} deleted`})
    });

        test("404 error is cannot find user", async function() {
            await request(app)
            .delete(`/jobs/${testData.job.id}`)
            .send({ 
                _token: testData.user.token 
            });

            const responce = await request(app)
            .delete(`/jobs/${testData.job.id}`)
            .send({
                _token: testData.user.token
            })

            expect(responce.statusCode).toBe(404);
    })
})