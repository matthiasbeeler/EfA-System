var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal } = require("../javascript/entry");
var router = express.Router();
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
        .statistics == true
    )
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
router.get("/", function (req, res) {
  database.query(
    "SELECT entitlement, logLocation FROM entryLogs;",
    function (error, results, fields) {
      var receivers = 0;
      var aReceivers = 0;
      var bReceivers = 0;
      var aReceiversLoc = 0;
      var bReceiversLoc = 0;
      var registrationsLoc = 0;
      var receiversLoc = 0;
      results.forEach((element) => {
        receivers++;
        if (element.entitlement == "A") return aReceivers++;
        if (element.entitlement == "B") return bReceivers++;
      });
      results.forEach((element) => {
        if (
          element.logLocation ==
          jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          receiversLoc++;
        if (
          element.entitlement == "A" &&
          element.logLocation ==
            jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          return aReceiversLoc++;
        if (
          element.entitlement == "B" &&
          element.logLocation ==
            jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          return bReceiversLoc++;
      });
      database.query(
        "SELECT * FROM receivers;",
        function (error, results, fields) {
          results.forEach((element) => {
            if (
              element.registrationLocation ==
              jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
            )
              registrationsLoc++;
          });
        }
      );
      database.query(
        "SELECT count(*) as count FROM receivers;",
        function (error, results, fields) {
          res.render("admin/statistics", {
            title: "Statistik",
            receivers: receivers,
            aReceivers: aReceivers,
            bReceivers: bReceivers,
            registrations: results[0].count,
            aReceiversLoc: aReceiversLoc,
            bReceiversLoc: bReceiversLoc,
            registrationsLoc: registrationsLoc,
            registrationsLocDate: "--",
            receiversLoc: receiversLoc,
            location: jwt.verify(req.cookies.Auth, process.env.jwtSecret)
              .location,
          });
        }
      );
    }
  );
});

router.get("/:date/", function (req, res) {
  database.query(
    "SELECT entitlement, logLocation FROM entryLogs WHERE date = ?;",
    [req.params.date],
    function (error, results, fields) {
      if (!results.length > 0) {
        return res.render("admin/statistics", {
          title: req.params.date,
          receivers: "--",
          aReceivers: "--",
          bReceivers: "--",
          registrations: "--",
          aReceiversLoc: "--",
          bReceiversLoc: "--",
          registrationsLoc: "--",
          receiversLoc: "--",
          registrationsLocDate: "--",
          location: jwt.verify(req.cookies.Auth, process.env.jwtSecret)
            .location,
        });
      }
      var receivers = 0;
      var aReceivers = 0;
      var bReceivers = 0;
      var aReceiversLoc = 0;
      var bReceiversLoc = 0;
      var registrationsLoc = 0;
      var receiversLoc = 0;
      registrationsLocDate = 0;
      results.forEach((element) => {
        receivers++;
        if (element.entitlement == "A") return aReceivers++;
        if (element.entitlement == "B") return bReceivers++;
      });
      results.forEach((element) => {
        if (
          element.logLocation ==
          jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          receiversLoc++;
        if (
          element.entitlement == "A" &&
          element.logLocation ==
            jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          return aReceiversLoc++;
        if (
          element.entitlement == "B" &&
          element.logLocation ==
            jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
        )
          return bReceiversLoc++;
      });
      database.query(
        "SELECT * FROM receivers;",
        function (error, results, fields) {
          results.forEach((element) => {
            if (
              element.registrationLocation ==
              jwt.verify(req.cookies.Auth, process.env.jwtSecret).location
            )
              registrationsLoc++;
              if (
                element.registrationLocation ==
                jwt.verify(req.cookies.Auth, process.env.jwtSecret).location && element.registrationDate == req.params.date
              )
              registrationsLocDate++;
          });
        }
      );
      database.query(
        "SELECT count(*) as count FROM receivers WHERE date = ?;",
        [req.params.date],
        function (error, results, fields) {
          var count = "--";
          if (results) count = results[0].count;

          res.render("admin/statistics", {
            title: req.params.date,
            receivers: receivers,
            aReceivers: aReceivers,
            bReceivers: bReceivers,
            registrations: count,
            aReceiversLoc: aReceiversLoc,
            bReceiversLoc: bReceiversLoc,
            registrationsLoc: registrationsLoc,
            registrationsLocDate: registrationsLocDate,
            receiversLoc: receiversLoc,
            location: jwt.verify(req.cookies.Auth, process.env.jwtSecret)
              .location,
          });
        }
      );
    }
  );
});

module.exports = router;
