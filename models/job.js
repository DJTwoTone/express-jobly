//defines a Job class for the Jobly app

const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

class Job {

    //creates a function to get a list of all jobs in the database
    static async getAllJobs(data) {
        //sets up filtering the jobs
        let baseQuery = "SELECT id, title, company_handle FROM jobs";
        let wheres = [];
        let values = [];

        //allows for searches by minimum salary
        if (data.min_salary) {
            values.push(parseFloat(data.min_salary))
            wheres.push(`salary >= $${values.length}`);
        };

        //allows for searches by minimum equity
        if (data.min_equity) {
            values.push(parseFloat(data.min_equity));
            wheres.push(`equity >= $${values.length}`);
        };

        //allows for searches of job titles
        if (data.search) {
            values.push(`%${data.search}%`);
            wheres.push(`title ILIKE $${values.length}`)
        };

        //if there are any searches, this begins the parameters for the search
        if (wheres.length > 0) {
            baseQuery += " WHERE "
        };

        //finalizes the search query
        let query = baseQuery + wheres.join(" AND ");

        const jobs = await db.query(query, values);
        return jobs.rows;
    };

    //creates a function for getting a job by job id
    static async getJob(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1`, [id]
        );

        let job = result.rows[0];

        //returns an error if there is no job with that id
        if (!job) {
            throw new ExpressError(`Job #${id} does not exist`, 404)
        };

        //gets the company info for that job
        const company = await db.query(
            `SELECT name, num_employees, description, logo_url
            FROM companies
            WHERE handle = $1`, [job.company_handle]
        );

        //adds company info before the job is returned
        job.company = company.rows[0];
        
        return job;
    };

    //creates a function to create new jobs
    static async create(data) {
        let { title, salary, equity, company_handle } = data;
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );
        return result.rows[0];
    };

    //creates a function to update job info
    static async update(id, data) {

        //creates a query for updating the job info
        let { query, values } = partialUpdate("jobs", data, "id", id);

        const result = await db.query(query, values);
        const job = result.rows[0];

        //returns an error if the job cannot be found
        if (!job) {
            throw new ExpressError(`Job #${id} does not exist.`, 404)
        };

        return job;
    };

    //creates a function for deleting jobs
    static async delete(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`, [id]
        );

        //returns an error if the job cannot be found
        if (result.rows.length === 0) {
            throw new ExpressError(`Job #${id} does not exist.`, 404);
        };
    };

};

module.exports = Job;