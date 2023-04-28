var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal } = require("../javascript/entry");
const moment = require("moment");
const { addNew } = require("../javascript/volunteerCards/addNew");
const { log } = require("../javascript/volunteerCards/log");
var router = express.Router();
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
        .volunteerCards == true
    )
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});


router.get("/", function (req, res) {
  res.render("admin/volunteerCards/home");
});
router.post("/", function (req, res) {
   log(req, res, database)
});
router.get("/manual", function (req, res) {
  res.render("admin/volunteerCards/manual");
});

router.get("/administration", function (req, res, next) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
      .volunteerCards !== true
  )
    return res.redirect("/admin");
  database.query(
    `SELECT * FROM volunteerCards;`,
    function (error, results, fields) {
      if (error) return res.redirect("/admin");
      res.render("admin/volunteerCards/administrationSearch", {
        results: results,
      });
    }
  );
});

router.get("/addNew", function (req, res) {
  res.render("admin/volunteerCards/addNew");
});

router.post("/addNew", function (req, res) {
  addNew(req, res, database);
});

router.get("/:id", function (req, res) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
      .volunteerCards !== true
  )
    return res.redirect("/admin");
  try {
    database.query(
      `SELECT * FROM volunteerCards WHERE id = ?`,
      [req.params.id],
      function (error, results, fields) {
        if (error) console.log(error);
        if (error) return res.redirect("/admin");
        var volunteerData = results;

        database.query(
          `SELECT * FROM volunteerCardsLog WHERE cardID = ?`,
          [req.params.id],
          function (error, results, fields) {
            if (error) console.log(error);
            if (error) return res.redirect("/admin");
            res.render("admin/volunteerCards/administration", {
              logResults: results,
              volunteerData: volunteerData,
            });
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/");
  }
});

router.get("/administration/:id/edit", function (req, res, next) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
      .volunteerCards !== true
  )
    return res.redirect("/admin");
  try {
    database.query(
      `SELECT * FROM volunteerCards WHERE id = ?`,
      [req.params.id],
      function (error, results, fields) {
        var volunteer = results;
       
        res.render("admin/volunteerCards/administrationEdit", {
          result: volunteer,
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.redirect("/admin/");
  }
});
router.post("/administration/:id/edit", function (req, res, next) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
      .volunteerCards !== true
  )
    return res.redirect("/admin");
  try {
    database.query(
      "UPDATE volunteerCards SET name=?, comment=? WHERE id = ?",
      [req.body.name, req.body.comment, req.params.id],
      function (error, results, fields) {
        if (error) console.log(error);
        if (error)
          return res.json({
            success: false,
            message: "An error occured",
          });
        if (!error) return res.json({ success: true });
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return res.json({ success: false });
  }
});

module.exports = router;
