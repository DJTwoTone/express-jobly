//defining the jobs routes for the Jobly app 

const express = require('express');
const ExpressError = require('../helpers/expressError');
const Job = require('../models/Job');

const jsonschema = require('jsonschema')
const { newJobSchema, updateJobSchema } = require('../schemas')
const { authUser, authAdmin } = require('../middleware/auth')


const router = express.Router()

// POST /jobs
// It should return JSON of {job: jobData}

router.post('/', authAdmin, async function(req, res, next) {
    try {

        //validating new jobs contain the needed info
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
// It should return JSON of {job: jobData}

router.get('/:id', authUser, async function(req, res, next) {
    try {
        const jobId = req.params.id;

        //checks if job id exists
        const check = await Job.jobCheck(jobId);

        if (!check) {
            throw new ExpressError(`Job #${jobId} does not exist`, 404);
        }

        const job = await Job.getJob(jobId);
        console.log(job)
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})

// PATCH /jobs/[id]
// It should return JSON of {job: jobData}

router.patch('/:id', authAdmin, async function(req, res, next) {
    try {

        const jobId = req.params.id;

        // disallows users from changing job ids
        if ('id' in req.body) {
            throw new ExpressError("Job ID's may not be changed.", 400);
        }

        //checks if job id exists
        const check = await Job.jobCheck(jobId);

        if (!check) {
            throw new ExpressError(`Job #${jobId} does not exist`, 404);
        }


        //validates info for job changes
        const validation = jsonschema.validate(req.body, updateJobSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400)
        }

        const job = await Job.update(jobId, req.body);
        return res.json({ job })
    } catch (e) {
        return next(e)
    }
})

// DELETE /jobs/[id]
// It should return JSON of { message: "Job deleted" }

router.delete('/:id', authAdmin, async function (req, res, next) {
    try {
        const jobId = req.params.id;

        //checks if job id exists
        const check = await Job.jobCheck(jobId);

        if (!check) {
            throw new ExpressError(`Job #${jobId} does not exist`, 404);
        }

        await Job.delete(jobId);
        return res.json({ message: `Job #${req.params.id} deleted` })
    } catch (e) {
        return next(e)
        
    }
})

module.exports = router;