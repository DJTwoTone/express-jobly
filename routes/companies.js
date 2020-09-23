const express = require("express")

const router = new express.Router()

const ExpressError = require("../helpers/expressError")






// GET /companies
// This should return the handle and name for all of the company objects. It should also allow for the following query string parameters

router.get("/", async function (req, res, next) {
    try {
        
    } catch (e) {
        
    }
})

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

// Validation and Testing
// For your POST and PATCH methods, you should validate the provided data with the JSON schema validator.

// Add tests for each route you created in this section.