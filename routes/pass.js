var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal, cardForgotten } = require("../javascript/entry");
const { signupPass } = require("../javascript/volunteerPass/signup");
const { loginPass } = require("../javascript/volunteerPass/login");
var router = express.Router();
const bwipjs = require("bwip-js");
const { passwordForgotten, resetForgottenPassword } = require("../javascript/volunteerPass/forgotPassword");
const { settingsPasswordChange, updateImage } = require("../javascript/volunteerPass/settingsUpdate");
const fs = require('fs')
const { validate } = require("uuid");


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

router.get("/passwordForgotten", function (req, res) {
  res.render('public/timetable/pass/forgotPassword')
});

router.get("/resetPassword/:token", function (req, res) {
  res.render('public/timetable/pass/resetForgottenPassword', {token: req.params.token})
});

router.post("/guest", function (req, res) {
  req.session.timetableType = "guest";
  res.json({success: true})
});

router.post("/resetPassword", function (req, res) {
  resetForgottenPassword(req, res, database);
});

router.post("/passwordForgotten", function (req, res) {
  passwordForgotten(req, res, database);
});

router.post("/signup", function (req, res) {
  signupPass(req, res, database);
});

router.post("/login", function (req, res) {
  loginPass(req, res, database);
});

router.all(["*"], function (req, res, next) {
  console.log("hi")
  try {
    if (jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret).loggedin){
      req.session.timetableType = "pass";
      return next();
    }else{
      
    res.redirect("/timetable/pass?red=/timetable/pass"+req.url);
    }
  } catch (error) {
    console.log(error)
    res.redirect("/timetable/pass?red=/timetable/pass"+req.url);
  }
});





router.get("/home", function (req, res) {
  var jwtData = jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret);
  bwipjs.toBuffer(
    {
      bcid: "qrcode", // Barcode type
      text: `{"type":"volunteer", "id":"${
        jwtData.id
      }", "timestamp": "${Date.now()}"}`, // Text to encode
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
          "SELECT volunteers.shifts, volunteerPasses.profilePictureUpdate FROM volunteers JOIN volunteerPasses ON volunteers.id = volunteerPasses.id WHERE volunteers.id = ?;",
          [jwtData.id],
          function (error, results, fields) {
              if (error) console.log(error);
              if (error)
                return response.json({
                  success: false,
                  error: 4,
                  message: "An error occured.",
                });
            if(!error)return res.render("public/timetable/pass/home", {
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

router.get("/passwordChange", function (req, res) {
  res.render("public/timetable/pass/settingsUpdate");
});

router.post("/settingsPasswordChange", function (req, res) {
  settingsPasswordChange(req, res, database);
});

router.get("/profileImageChange", function (req, res) {
  res.render("public/timetable/pass/imageUpdate");
});

router.post("/profileImageChange", function (req, res) {
  updateImage(req, res, database);
});


router.all('/uploads/profileImages/:id', function(req, res, next) {
  try {
  var imagePath;
  if(validate(req.params.id.split(".")[0]) && req.params.id.split(".").length == 2 && req.params.id.split(".")[1] == "webp") {
    imagePath = req.params.id;
  }else{
    imagePath = "0"
  }
  fs.readFile(process.cwd()+ "/uploads/efaPassImages/"+imagePath, (err, data) => {
    if (!err && data) {
      return res.sendFile(process.cwd()+ "/uploads/efaPassImages/"+imagePath)
    }else{
      return res.sendFile(process.cwd()+ "/public/images/svg/placeholderProfile.svg")    }
  })

    
} catch (error) {
    console.log(error)
}
});


router.get("/logout", (req, res) => {
  res.clearCookie("EfAPassAuth");
  req.session.timetableType = undefined;
  res.redirect("/timetable/pass");
});
module.exports = router;
