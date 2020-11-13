const express = require("express")

const router = new express.Router()

const ExpressError = require("../helpers/expressError")
// const { adminRequired, authRequired } = require()


const Company = require("../models/company")
const jsonschema = require('jsonschema');
const { newCompanySchema, updateCompanySchema } = require('../schemas')
const { authUser, authAdmin } = require('../middleware/auth')

// GET /companies
// This should return the handle and name for all of the company objects. It should also allow for the following query string parameters

router.get("/", authUser, async function (req, res, next) {
    try {
        const companies = await Company.getCompanies(req.query);
        return res.json({ companies })

    } catch (e) {
        return next(e)
    }
})

// search. If the query string parameter is passed, a filtered list of handles and names should be displayed based on the search term and if the name includes it.
// min_employees. If the query string parameter is passed, titles and company handles should be displayed that have a number of employees greater than the value of the query string parameter.
// max_employees. If the query string parameter is passed, a list of titles and company handles should be displayed that have a number of employees less than the value of the query string parameter.
// If the min_employees parameter is greater than the max_employees parameter, respond with a 400 status and a message notifying that the parameters are incorrect.
// This should return JSON of {companies: [companyData, ...]}





// GET /companies/[handle]
// This should return a single company found by its id.

router.get("/:handle", authUser, async function (req, res, next) {
    try {
        const handle = req.params.handle;
        const company = await Company.getCompany(handle);
        
        return res.json({ company })
    } catch (e) {
        return next(e)
    }
})

// POST /companies
// This should create a new company and return the newly created company.

// This should return JSON of {company: companyData}

router.post("/", authAdmin, async function (req, res, next) {
    try {
        const validation = jsonschema.validate(req.body, newCompanySchema);

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400)
        }
        // console.log('req.body --->', req.body)
        const company = await Company.create(req.body);
        return res.status(201).json({ company })
        
    } catch (e) {
        return next(e)
    }
})
// This should return JSON of {company: companyData}

// PATCH /companies/[handle]
// This should update an existing company and return the updated company.

// This should return JSON of {company: companyData}

router.patch("/:handle", authAdmin, async function (req, res, next) {
    try {
        if ('handle' in req.body) {
            throw new ExpressError("Your handle may not be changed", 400)
        }

        const validation = jsonschema.validate(req.body, updateCompanySchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }
        
        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company })
    } catch (e) {
        return next(e)
    }
})

// DELETE /companies/[handle]
// This should remove an existing company and return a message.

// This should return JSON of {message: "Company deleted"}

router.delete("/:handle", authAdmin, async function (req, res, next) {
    try {
        await Company.remove(req.params.handle);
        return res.json({ message: `Company (${req.params.handle}) sucessfully deleted`})
    } catch (e) {
        return next(e)
    }
})

// Validation and Testing
// For your POST and PATCH methods, you should validate the provided data with the JSON schema validator.

// Add tests for each route you created in this section.

module.exports = router;