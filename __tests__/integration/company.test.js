const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = require('../../app')
const db = require('../../db')

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
        // console.log(testUser);

        testData.user = testUser.rows[0];
        // console.log(testData);

        const responce = await request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'password'
            });
            testData.user.token = responce.body.token;
            // console.log(testData)

        const testCompany = await db.query(
            `INSERT INTO companies (handle, name, num_employees)
            VALUES ('ufp', 'starfleet', 1000)
            RETURNING *`
        );

        testData.company = testCompany.rows[0];
        // console.log(testData);

        const testJob = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ('charismatic captain', 1000000, 0.1, 'ufp')
            RETURNING *`
        );

        testData.job = testJob.rows[0];

        // console.log(testData);
        
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

describe('test POST route companies', async function() {
    test('creating a new company', async function() {
        const responce = await request(app)
        .post('/companies')
        .send({
            handle: 'test',
            name: 'test company',
            _token: testData.user.token
        });
        expect(responce.statusCode).toBe(201);
        expect(responce.body.company).toHaveProperty('handle');
    })

    test('not creating a company with handle existing', async function() {
        const responce = await request(app)
            .post('/companies')
            .send({
                handle: "ufp",
                name: 'united federation of planets',
                _token: testData.user.token
            });
            expect(responce.statusCode).toBe(400);
    })
})

describe("test GET route companies", async function() {
    test('gets list of test company', async function() {
        const responce = await request(app)
        .get('/companies')
        .send({
            _token: testData.user.token
        });
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })

    test('search works', async function() {
        const responce = await request(app)
        .get('/companies?search=star')
        .send({
            _token: testData.user.token
        });
        console.log(responce.body.companies)
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })

    test(' min_employees works', async function() {
        const responce = await request(app)
        .get('/companies?min_employees=999')
        .send({
            _token: testData.user.token
        });
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })

    test(' max_employees works', async function() {
        const responce = await request(app)
        .get('/companies?max_employees=1500')
        .send({
            _token: testData.user.token
        });
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })

    test('min_employees with max_employees works', async function() {
        const responce = await request(app)
        .get('/companies?max_employees=1500&min_employees=999')
        .send({
            _token: testData.user.token
        });
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })

    test('search min_employees with max_employees works', async function() {
        const responce = await request(app)
        .get('/companies?max_employees=1500&min_employees=999&search=star')
        .send({
            _token: testData.user.token
        });
        expect(responce.body.companies).toHaveLength(1);
        expect(responce.body.companies[0]).toHaveProperty('handle');
        expect(responce.body.companies[0].handle).toBe('ufp');
    })
})

describe('test GET route companies/:handle', async function() {
    test('get a company by handle', async function() {
        const responce = await request(app)
        .get(`/companies/${testData.company.handle}`)
        .send({
            _token: testData.user.token
        });
        expect(responce.body.company).toHaveProperty('handle');
        expect(responce.body.company.handle).toBe('ufp');
    })

    test('404 error if cannot find company handle', async function() {
        const responce = await request(app)
        .get('/companies/kge')
        .send({
            _token: testData.user.token
        })
        expect(responce.statusCode).toBe(404)
    });
})

describe('test PATCH route companies', async function() {
    test('updates company name', async function() {
        const responce = await request(app)
        .patch(`/companies/${testData.company.handle}`)
        .send({
            name: "united federation of planets",
            _token: testData.user.token
        })
        expect(responce.body.company).toHaveProperty('name');
        expect(responce.body.company.name).toBe('united federation of planets');
        expect(responce.body.company.name).not.toBe('starfleet');
    })

    test('does not update if not validated', async function() {
        const responce = await request(app)
        .patch(`/companies/${testData.company.handle}`)
        .send({
            alignment: "chaotic evil",
            _token: testData.user.token
        })
        expect(responce.statusCode).toBe(400);
    })

    test('404 error if cannot find company handle', async function() {
        const responce = await request(app)
        .patch(`/companies/kge`)
        .send({
            name: "The Klingon Galactic Empire",
            _token: testData.user.token
        })
        expect(responce.statusCode).toBe(404);
    })
})

describe('test DELETE route companies', async function() {
    test('deletes a company', async function() {
        const responce = await request(app)
        .delete(`/companies/${testData.company.handle}`)
        .send({
            _token: testData.user.token
        });
        expect(responce.body).toEqual({ message: 'Company (ufp) sucessfully deleted' })
        
        const listRes = await request(app).get('/companies').send({ _token: testData.user.token });
        expect(listRes.body.companies).toHaveLength(0);
    })

    test('404 error if cannot find company handle', async function() {
        const responce = await request(app)
        .delete(`/companies/kge`)
        .send({
            _token: testData.user.token
        })
        expect(responce.statusCode).toBe(404);
    })
})