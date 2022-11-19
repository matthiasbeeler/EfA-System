var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var session = require("express-session");
var MemcachedStore = require('connect-memcached')(session);

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");
var preRegRouter = require("./routes/preReg");
var receiverRegistration = require("./routes/receiverRegistration");
var receiverMaintenance = require("./routes/receiverMaintenance");
var entry = require("./routes/entry");
var statistics = require("./routes/statistics");
var print = require("./routes/print");
var timetable = require("./routes/timetable");
var volunteers = require("./routes/volunteers");
const i18n = require("./javascript/i18n");

var app = express();
app.use(i18n);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
var favicon = require("serve-favicon");
app.use(favicon(path.join(__dirname, "/public/images/efaLogo.png")));
app.use(cookieParser());
app.use(
  session({
    secret: "REMOVED",
    proxy: "true",
    key: "Essen fuer Alle",
    resave: false,
    saveUninitialized: true,
  })
);
if (process.env.PORT == 4090) {
  app.use(
    session({
      secret: "REMOVED",
      proxy: "true",
      key: "Essen fuer Alle",
      resave: false,
      saveUninitialized: true,
      store: new MemcachedStore({
        hosts: ["127.0.0.1:11211"],
      }),
    })
  );

}else{
  app.use(
    session({
      secret: "REMOVED",
      proxy: "true",
      key: "Essen fuer Alle",
      resave: false,
      saveUninitialized: true,
    })
  );
}
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/preReg", preRegRouter);
app.use("/admin/receiverRegistration", receiverRegistration);
app.use("/admin/receiverMaintenance", receiverMaintenance);
app.use("/admin/entry", entry);
app.use("/admin/statistics", statistics);
app.use("/admin/print", print);
app.use("/admin/volunteers", volunteers);
app.use("/timetable", timetable);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
