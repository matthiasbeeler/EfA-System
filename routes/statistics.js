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
      var registrationsPaidLoc = 0;

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
        "SELECT count(*) as count FROM receivers WHERE registrationLocation = ?;",[jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
        function (error, results, fields) {
              registrationsLoc = results[0].count;
        }
      );
      database.query(
        `SELECT DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') AS date, SUM(CASE WHEN entitlement = 'A' THEN 1 ELSE 0 END) AS aCount, 
        SUM(CASE WHEN entitlement = 'B' THEN 1 ELSE 0 END) AS bCount, COUNT(*) as totalCount
        FROM EfA.entryLogs WHERE logLocation = ?
        GROUP BY DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') ORDER BY  DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') ASC;`, [jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
        function (error, results, fields) {
          var logData = results;
          database.query(
            `SELECT  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') AS registrationDate, SUM(CASE WHEN paid = 0 THEN 1 ELSE 0 END) AS unpaid, 
            COUNT(*) as totalCount
           FROM EfA.receivers WHERE registrationLocation = ? AND registrationDate IS NOT NULL
           GROUP BY  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') ORDER BY  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') ASC;`, [jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
            function (error, results, fields) {
              console.log(error)
              var registrationData = results;
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
            registrationsLocPaidDate: "--",
            registrationsLocUnpaidDate: "--",
            receiversLoc: receiversLoc,
            location: jwt.verify(req.cookies.Auth, process.env.jwtSecret)
              .location,
              logData: JSON.stringify(logData),
              registrationData: JSON.stringify(registrationData)

          });
        }
      );
    }
  );
    }
  );
}
);
});

router.get("/:date/", function (req, res) {
  database.query(
    `SELECT DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') AS date, SUM(CASE WHEN entitlement = 'A' THEN 1 ELSE 0 END) AS aCount, 
    SUM(CASE WHEN entitlement = 'B' THEN 1 ELSE 0 END) AS bCount, COUNT(*) as totalCount
    FROM EfA.entryLogs WHERE logLocation = ?
    GROUP BY DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') ORDER BY  DATE_FORMAT(STR_TO_DATE(date , '%d.%m.%Y'), '%Y-%m-%d') ASC;`, [jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
    function (error, results, fields) {
      var logData = results;
      database.query(
        `SELECT  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') AS registrationDate, SUM(CASE WHEN paid = 0 THEN 1 ELSE 0 END) AS unpaid, 
        COUNT(*) as totalCount
       FROM EfA.receivers WHERE registrationLocation = ? AND registrationDate IS NOT NULL
       GROUP BY  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') ORDER BY  DATE_FORMAT(STR_TO_DATE(registrationDate , '%d.%m.%Y'), '%Y-%m-%d') ASC;`, [jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
        function (error, results, fields) {
          console.log(error)
          var registrationData = results;
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
            logData: logData,
            registrationData: JSON.stringify(registrationData)


        });
        
      }
      var receivers = 0;
      var aReceivers = 0;
      var bReceivers = 0;
      var aReceiversLoc = 0;
      var bReceiversLoc = 0;
      var registrationsLoc = 0;
      var receiversLoc = 0;
      var registrationsLocDate = 0;
      var registrationsLocPaidDate = 0;
      var registrationsLocUnpaidDate = 0;
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
              if (
                element.registrationLocation ==
                jwt.verify(req.cookies.Auth, process.env.jwtSecret).location && element.registrationDate == req.params.date && element.paid == 0
              )
              registrationsLocUnpaidDate++;
              if (
                element.registrationLocation ==
                jwt.verify(req.cookies.Auth, process.env.jwtSecret).location && element.registrationDate == req.params.date && element.paid == 1
              )
              registrationsLocPaidDate++;
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
            registrationsLocPaidDate: registrationsLocPaidDate,
            registrationsLocUnpaidDate: registrationsLocUnpaidDate,
            receiversLoc: receiversLoc,
            location: jwt.verify(req.cookies.Auth, process.env.jwtSecret)
              .location,
              logData: JSON.stringify(logData),
              registrationData: JSON.stringify(registrationData)

          });
        }
      );
    }
  );
});
});
});

module.exports = router;
