const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

class Job {

    static async getAllJobs(data) {
        let baseQuery = "SELECT id, title, company_handle FROM jobs";
        let wheres = [];
        let values = [];

        if (data.min_salary) {
            values.push(parseFloat(data.min_salary))
            wheres.push(`salary >= $${values.length}`);
        }

        if (data.min_equity) {
            values.push(parseFloat(data.min_equity));
            wheres.push(`equity >= $${values.length}`);
        }

        if (data.search) {
            values.push(`%${data.search}%`);
            wheres.push(`title ILIKE $${values.length}`)
        }

        if (wheres.length > 0) {
            query += " WHERE "
        }

        let query = baseQuery + wheres.join(" AND ")
        const jobs = await db.query(query, values)

        return jobs.rows;
    }

    static async getJob(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1`, [id]
        );

        let job = result.rows[0]

        if (!job) {
            throw new ExpressError(`Job #${id} does not exist`, 404)
        }

        const company = await db.query(
            `SELECT name, num_employees, description, logo_url
            FROM compnaies
            WHERE handle = $1`, [job.company_handle]
        )

        job.company = company.rows[0];

        return job
    }

    static async create(data) {
        let { title, salary, equity, company_handle } = data
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );

        return result.rows[0]
    }

    static async update(id, data) {
        let { query, values } = partialUpdate("jobs", data, "id", id);

        const result = await db.query(query, values)
        const job = result.rows[0]

        if (!job) {
            throw new ExpressError(`Job #${id} does not exist.`, 404)
        }

        return job;
    }

    static async delete(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`, [id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`Job #${id} does not exist.`, 404);
        }
    }

}

module.exports = Job;