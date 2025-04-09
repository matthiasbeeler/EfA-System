var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal, cardForgotten } = require("../javascript/entry");
var router = express.Router();
router.all(["*"], function (req, res, next) {
  console.log(req.cookie)

  if (req.query.key == process.env.jwtSecret) {
   
    next();
  } else {
    try {
      if (
        jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.accounts ==
        true
      )
        return next();
      res.redirect("/");
    } catch (error) {
      res.redirect("/");
    }
  }
});
router.get("/", function (req, res) {
  res.render("admin/entry");
});
router.get("/desktop", function (req, res) {
  res.render("admin/entryDesktop");
});

router.post("/", function (req, res) {
  normal(req, res, database);
});

router.get("/cardForgotten", function (req, res) {
  res.render("admin/cardForgotten");
});

router.post("/cardForgotten", function (req, res) {
  cardForgotten(req, res, database);
});

router.get("/manualEntry", function (req, res) {
  res.render("admin/manualEntry");
});

function nachtrag(logLocation) {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}.${month}.${year}`;
  const time = new Date()
    .toLocaleString("de-CH", {
      timeZone: "Europe/Zurich",
    })
    .split(", ")[1];
  var id = "31681282-bdfe-4493-921b-44dc4ee6a1d6";
  for (let index = 0; index < 70; index++) {
    database.query(
      `INSERT INTO entryLogs (id, logTime, entitlement, date,logLocation)
  VALUES (?, ?, ?, ?, ?)`,
      [id, time, "A", currentDate, logLocation],
      function (error, results, fields) {
        if (!error) console.log(index);
        if (error) console.log(error);
      }
    );
  }
}

//nachtrag('sz')
module.exports = router;
