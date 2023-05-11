var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal, cardForgotten } = require("../javascript/entry");
const { signupPass } = require("../javascript/volunteerPass/signup");
const { loginPass } = require("../javascript/volunteerPass/login");
var router = express.Router();
const bwipjs = require("bwip-js");

router.get(["/", "/login", "/signup"], function (req, res, next) {
  try {
    if (jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret).loggedin)
      return res.redirect("/timetable/pass/home");
    next()
  } catch (error) {
    next()
  }
});

router.get("/", function (req, res) {
  res.render("public/timetable/pass/start");
});

router.get("/login", function (req, res) {
  res.render("public/timetable/pass/login");
});

router.get("/signup", function (req, res) {
  res.render("public/timetable/pass/signup");
});

router.post("/signup", function (req, res) {
  signupPass(req, res, database);
});

router.post("/login", function (req, res) {
  loginPass(req, res, database);
});

router.all(["*"], function (req, res, next) {
  try {
    if (jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret).loggedin)
      return next();
    res.redirect("/timetable/pass");
  } catch (error) {
    res.redirect("/timetable/pass");
  }
});

router.get("/home", function (req, res) {
  var jwtData = jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret);
  bwipjs.toBuffer(
    {
      bcid: "qrcode", // Barcode type
      text: `{"type":"volunteer", "id":"${
        jwtData.id
      }", timestamp: "${Date.now()}"}`, // Text to encode
      scale: 3,
      includetext: true, // Show human-readable text
      textxalign: "center",
      backgroundcolor: "fffffff",
      padding: 3,
    },
    function (err, png) {
      if (err) {
        console.log(err);
      } else {
        const imgBase64 = png.toString("base64");
        database.query(
          "SELECT shifts FROM volunteers WHERE id = ?;",
          [jwtData.id],
          function (error, results, fields) {
            return res.render("public/timetable/pass/home", {
              qrCode: "data:image/png;base64," + imgBase64,
              tokenData: jwtData,
              shiftData: results[0],
            });
          }
        );
      }
    }
  );
});

router.get("/settings", function (req, res) {
  var jwtData = jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret);
  database.query(
    "SELECT * FROM volunteerPasses WHERE id = ?;",
    [jwtData.id],
    function (error, results, fields) {
     if(error) console.log(error)
     if (error) return res.redirect('/timetable/pass')
      res.render("public/timetable/pass/settings", { data: results });
    }
  );
});

router.get("/logout", (req, res) => {
  res.clearCookie("EfAPassAuth");
  res.redirect("/timetable/pass");
});
module.exports = router;
