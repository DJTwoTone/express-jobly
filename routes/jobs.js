const express = require('express');
const ExpressError = require('../helpers/expressError');
const Job = require('../models/Job');

const jsonschema = require('jsonschema')
const { newJobSchema, updateJobSchema } = require('../schemas')
const { authUser, authAdmin } = require('../middleware/auth')


const router = express.Router()

// POST /jobs
// This route creates a new job and returns a new job.

// It should return JSON of {job: jobData}

router.post('/', authAdmin, async function(req, res, next) {
    try {
        const validation = jsonschema.validate(req.body, newJobSchema);

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400)
        }

        const job = await Job.create(req.body);
        return res.status(201).json({ job })
    } catch (e) {
        return next(e)
    }
})

// GET /jobs
// This route should list all the titles and company handles for all jobs, ordered by the most recently posted jobs. It should also allow for the following query string parameters

// search: If the query string parameter is passed, a filtered list of titles and company handles should be displayed based on the search term and if the job title includes it.
// min_salary: If the query string parameter is passed, titles and company handles should be displayed that have a salary greater than the value of the query string parameter.
// min_equity: If the query string parameter is passed, a list of titles and company handles should be displayed that have an equity greater than the value of the query string parameter.
// It should return JSON of {jobs: [job, ...]}

router.get('/', authUser, async function(req, res, next) {
    try {
        const jobs = await Job.getAllJobs(req.query);
        return res.json({ jobs })
    } catch (e) {
        return next(e)
    }
})

// GET /jobs/[id]
// This route should show information about a specific job including a key of company which is an object that contains all of the information about the company associated with it.

// It should return JSON of {job: jobData}

router.get('/:id', authUser, async function(req, res, next) {
    try {
        console.log(req.params.id)
        const job = await Job.getJob(req.params.id);
        console.log(job)
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})

// PATCH /jobs/[id]
// This route updates a job by its ID and returns an the newly updated job.

// It should return JSON of {job: jobData}

router.patch('/:id', authAdmin, async function(req, res, next) {
    try {
        if ('id' in req.body) {
            throw new ExpressError("Job ID's may not be changed.", 400);
        }

        const validation = jsonschema.validate(req.body, updateJobSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400)
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})

// DELETE /jobs/[id]
// This route deletes a job and returns a message.

// It should return JSON of { message: "Job deleted" }

router.delete('/:id', authAdmin, async function (req, res, next) {
    try {
        await Job.delete(req.params.id);
        return res.json({ message: `Job #${req.params.id} deleted` })
    } catch (e) {
        return next(e)
        
    }
})

module.exports = router;