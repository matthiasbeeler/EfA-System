var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal } = require("../javascript/entry");
const { getPrintData, setId } = require("../javascript/print");
var router = express.Router();
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
        .print == true
    )
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
router.get("/", function (req, res) {
    res.render('admin/print')
})
router.post("/getData", function (req, res) {
    getPrintData(req, res, database)
})
router.post("/setId", function (req, res) {
    setId(req, res, database)
})
module.exports = router;
