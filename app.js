/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());
const cRoutes = require("./routes/companies")
const iRoutes = require("./routes/invoices")
const indRoutes = require("./routes/industries")

app.use("/companies", cRoutes);
app.use("/invoices", iRoutes)
app.use("/industries", indRoutes)


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  let status = err.status || 500; 

  res.status(status).json({
    error:{
      message: err.message,
      status
    }
  });
});


module.exports = app;
