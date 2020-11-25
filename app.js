/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");

const app = express();

//These are the 4 required routes for the Jobly app
const companiesRoutes = require("./routes/companies")
const jobsRoutes = require("./routes/jobs")
const userRoutes = require('./routes/users')
const loginRoute = require('./routes/login')

app.use(express.json());

//These set up the actual routes to be used
app.use("/companies", companiesRoutes);
app.use("/jobs", jobsRoutes);
app.use("/users", userRoutes);
app.use("/", loginRoute);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
