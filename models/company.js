//defines a Comapny class for the Jobly app

const db = require("../db")
// const ExpressError = require("../helpers/expressError");
const PartialUpdate = require("../helpers/partialUpdate")


class Company {

    static async companyCheck(handle) {
        const result = await db.query(
            `SELECT *
            FROM companies
            WHERE handle=$1`, [handle]
            );

            if (result.rows.length) {
                return true;
            };

            return false;
    };


    //creates a function to get a list of all companies
    static async getCompanies(data) {
        //sets up filtering the companies
        let baseQuery = 'SELECT handle, name FROM companies';
        let wheres = [];
        let values = [];
        const min_employees = parseInt(data.min_employees);
        const max_employees = parseInt(data.max_employees);
        
        //allows for searches by company name
        if (data.search) {
            values.push(`%${data.search}%`);
            wheres.push(`name ILIKE $${values.length}`);
        };
        
        //allows for search by minimum number of employees in a company
        if (data.min_employees) {
            values.push(min_employees);
            wheres.push(`num_employees >= $${values.length}`);
        };

        //allows for search by maximum number of employees in a company
        if (data.max_employees) {
            values.push(max_employees);
            wheres.push(`num_employees <= $${values.length}`);
        };

        //if there are any searches, this begins the parameters for the search
        if (wheres.length > 0) {
            baseQuery += " WHERE ";
        };
       //finalizes the search query
        let query = baseQuery + wheres.join(" AND ") + " ORDER BY name";

        const companies = await db.query(query, values);
        return companies.rows
    };


    
    //creates a function for getting a company by its handle
    static async getCompany(handle) {
        const result = await db.query(
            `SELECT *
            FROM companies
            WHERE handle=$1`, [handle]
            );
            
            const company = result.rows[0];
            
            const jobs = await db.query(
                `SELECT id, title, salary, equity
                FROM jobs
                WHERE company_handle = $1`, [handle]
            );

            //adds the jobs to the comapny before it is returned
            company.jobs = jobs.rows;
            
            return company;
        };
        
        //creates a function for making new companies
        static async create(data) {
            const {handle, name, num_employees, description, logo_url} = data;
            
            //inserts new companies into the database
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
            );
            
            return result.rows[0];
        };

        //creates a function for changing company info
        static async update(handle, data) {

        //creates a query for updating the company info
            let { query, values } = PartialUpdate("companies", data, "handle", handle);

            const result = await db.query(query, values);

            console.log(result)
            const company = result.rows[0];

            return company;
        };

    //creates a function for deleting companies
    static async remove(handle) {
        const result = await db.query(
            `DELETE FROM companies
            WHERE handle = $1
            RETURNING handle`, [handle]
        );
    };

};

module.exports = Company;