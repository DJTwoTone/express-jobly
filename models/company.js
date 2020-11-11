/** Company class for Jobly */

const db = require("../db")
const ExpressError = require("../helpers/expressError");
// const sqlForPartialUpdate = require("../helpers/partialUpdate");
const PartialUpdate = require("../helpers/partialUpdate")


class Company {
    // constructor({handle, name, num_employees, description, logo_url}) {
    //     this.handle = handle;
    //     this.name = name;
    //     this.num_employees = num_employees;
    //     this.description = description;
    //     this.logo_url = logo_url;
    // }

    /** find all customers */

    static async getAllCompanies(data) {
        let baseQuery = 'SELECT handle, name FROM companies';
        let wheres = [];
        let values = [];
        const min_employees = parseInt(data.min_employees);
        const max_employees = parseInt(data.max_employees);

        if (parseInt(data.min_employees) >= parseInt(data.mmax_employees)) {
            throw new ExpressError(
                'Minimum employees cannot be less than or even equal to maximum employees',
                400
            )
        }

        if (data.min_employees) {
            values.push(parseInt(data.min_employees));
            wheres.push(`num_employees >= $${values.length}`);
        };

        if (data.max_employees) {
            values.push(parseInt(data.max_employees));
            wheres.push(`num_employees >= $${values.length}`);
        };

        if (data.search) {
            values.push(`%${data.search}%`);
            wheres.push(`name ILIKE $${values.length}`);
        };

        if (wheres > 0) {
            baseQuery += " WHERE ";
        }

        let query = baseQuery + wheres.join(" AND ") + "ORDER BY name";

        const companies = await db.query(query, values);
        return companies.rows
    }

    
    static async getCompany(handle) {
        const result = await db.query(
            `SELECT *
            FROM companies
            WHERE handle=$1`, [handle]
            )
            
            const company = result.rows[0]
            
            if (!company) {
                throw new ExpressError(`A company with the handle ${handle} does not exist`, 404);
            }

            const jobs = await db.query(
                `SELECT id, title, salary, equity
                FROM jobs
                WHERE company_handle = $1`, [handle]
            );

            company.jobs = jobs.rows;
            
            return company
        }
        
        static async create({handle, name, num_employees, description, logo_url}) {
            const handleCheck = await db.query(
                `SELECT handle 
                FROM companies
                WHERE handle = $1`,
                [handle]
            );
    
            if (handleCheck.rows[0]) {
                throw new ExpressError(
                    `${handle} is not available. Please choose a different hande.`,
                    400
                );
            }
            
            const result = await db.query(
                `INSERT INTO companies (
                    handle,
                    name,
                    num_employees,
                    description,
                    logo_url)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING handle, name, num_employees, description, logo_url
                `, [handle, name, num_employees, description, logo_url]
            )
            
            return result.rows[0]
        }

        static async update(handle, data) {
            let { query, values } = partialUpdate(
            "companies", 
            data, 
            "handle", 
            handle
        );

        const result = await db.query(query, values);
        const company = result.rows[0]

        if (!company) {
            throw new ExpressError(`A company with the handle ${handle} does not exist`, 404);
        }

        return company
    }

    static async remove(handle) {
        const result = await db.query(
            `DELETE FROM companies
            WHERE handle = $1
            RETURNING handle`, [handle]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`A company with the handle ${handle} does not exist`, 404);
        }
    }

}


// Create an API that has the following five routes:

// GET /companies
// This should return the handle and name for all of the company objects. It should also allow for the following query string parameters

// search. If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
// min_employees. If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
// max_employees. If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
// If the min_employees parameter is greater than the max_employees parameter, respond with a 400 status and a message notifying that the parameters are incorrect.
// This should return JSON of {companies: [companyData, ...]}

// POST /companies
// This should create a new company and return the newly created company.

// This should return JSON of {company: companyData}

// GET /companies/[handle]
// This should return a single company found by its id.

// This should return JSON of {company: companyData}

// PATCH /companies/[handle]
// This should update an existing company and return the updated company.

// This should return JSON of {company: companyData}

// DELETE /companies/[handle]
// This should remove an existing company and return a message.

// This should return JSON of {message: "Company deleted"}

module.exports = { Company }