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
    "SELECT entitlement FROM entryLogs;",
    function (error, results, fields) {
      var receivers = 0;
      var aReceivers = 0;
      var bReceivers = 0;
      results.forEach((element) => {
        receivers++;
        if (element.entitlement == "A") return aReceivers++;
        if (element.entitlement == "B") return bReceivers++;
      });
      database.query(
        "SELECT count(*) as count FROM receivers;",
        function (error, results, fields) {
          res.render("admin/statistics", {
            title: "Statistik",
            receivers: receivers,
            aReceivers: aReceivers,
            bReceivers: bReceivers,
            registrations: results[0].count,
          });
        }
      );
    }
  );
});

router.get("/:date/", function (req, res) {
    database.query(
      "SELECT entitlement FROM entryLogs WHERE date = ?;",[req.params.date],
      function (error, results, fields) {
        if (!results.length > 0) {
            return  res.render("admin/statistics", {
                title: req.params.date,
                receivers: "--",
                aReceivers: "--",
                bReceivers: "--",
                registrations: "--",
              });
        }
            var receivers = 0;
        var aReceivers = 0;
        var bReceivers = 0;
        results.forEach((element) => {
          receivers++;
          if (element.entitlement == "A") return aReceivers++;
          if (element.entitlement == "B") return bReceivers++;
        });
        database.query(
          "SELECT count(*) as count FROM receivers WHERE date = ?;",[req.params.date],
          function (error, results, fields) {
            var count = "--"
            if(results) count = results[0].count;
            
            res.render("admin/statistics", {
              title: req.params.date,
              receivers: receivers,
              aReceivers: aReceivers,
              bReceivers: bReceivers,
              registrations: count,
            });
          }
        );
      }
    );
  });

module.exports = router;
