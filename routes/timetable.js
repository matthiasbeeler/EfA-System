var express = require("express");
const { database } = require("../javascript/db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require("libphonenumber-js");
const { register, searchSignOut, signOut } = require("../javascript/timetable");
var router = express.Router();
const bwipjs = require("bwip-js");
const { supportRequest } = require("../javascript/mailer");

router.get("/", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 30)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  if (req.session.shiftDate == undefined) req.session.shiftDate = result[0];
  if (!result.includes(req.session.shiftDate))
    req.session.shiftDate = result[0];
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.session.shiftDate],
    function (error, results, fields) {
      var freeShifts = 0;
      results.forEach((element) => {
        element.shifts.forEach((element) => {
          element.shifts.forEach((element) => {
            freeShifts = freeShifts + element.freeSpots;
          });
        });
      });
      res.render("public/timetable/home", {
        results: results,
        freeShifts: freeShifts,
        shiftDate: req.session.shiftDate,
      });
    }
  );
});
router.post("/", function (req, res) {
  req.session.shiftId = req.body.shiftType;
  req.session.volunteerName = req.body.name;
  req.session.volunteerEmail = req.body.email;
  return res.json({ success: true });
});
router.get("/chooseTime", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 30)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  if (
    req.session.shiftDate == undefined ||
    !result.includes(req.session.shiftDate)
  )
    req.session.shiftDate = result[0];
  if (!result.includes(req.session.shiftDate))
    req.session.shiftDate = result[0];
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.session.shiftDate],
    function (error, results, fields) {
      var shift = "";
      results[0].shifts.forEach((element) => {
        if (element.id == req.session.shiftId) shift = element;
      });

      if (!shift.shifts) return res.redirect("/timetable");
      return res.render("public/timetable/chooseTime", {
        results: shift.shifts,
        shiftName: shift.shiftName,
        shiftDate: req.session.shiftDate,
        volunteerName: req.session.volunteerName,
      });
    }
  );
});
router.post("/chooseTime", function (req, res) {
  register(req, res, database);
});
router.get("/registrationSuccess/:volunteerId", function (req, res) {
  bwipjs.toBuffer(
    {
      bcid: "qrcode", // Barcode type
      text: `{"type":"volunteer", "id":"${req.params.volunteerId}"}`, // Text to encode
      scale: 3,
      includetext: true, // Show human-readable text
      textxalign: "center",
      backgroundcolor: "ececec",
      padding: 3,
    },
    function (err, png) {
      if (err) {
        console.log(err);
      } else {
        const imgBase64 = png.toString("base64");
        if (
          !req.session.shiftName ||
          !req.session.shiftDate ||
          !req.session.volunteerName
        )
          return res.redirect("/timetable");
        return res.render("public/timetable/registrationSuccess", {
          qrCode: "data:image/png;base64," + imgBase64,
          session: req.session,
        });
      }
    }
  );
});

router.get("/support", function (req, res) {
  res.render("public/timetable/supportForm");
});
router.post("/support", function (req, res) {
  supportRequest(req, res);
});
router.get("/otherWeek/", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 21)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  res.render("public/timetable/otherWeek", { dates: result });
});
router.post("/chooseDate/", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 21)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  if (!result.includes(req.body.date)) return res.json({ success: false });
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.body.date],
    function (error, results, fields) {
      if (!results.length > 0)
        return res.json({ success: false, message: "NA" });
      req.session.shiftDate = req.body.date;
      return res.json({ success: true });
    }
  );
});

router.get("/signOut/", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 21)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  if (!result.includes(req.session.shiftDate))
    req.session.shiftDate = result[0];
  res.render("public/timetable/signOut", { shiftDate: req.session.shiftDate });
});
router.post("/signOut/search/", function (req, res) {
  searchSignOut(req, res, database)
})
router.post("/signOut/", function (req, res) {
  signOut(req, res, database)
})

router.get("/signOutEmail", function (req, res) {
  res.render('public/timetable/signOutEmail')
})
router.get('/showQR/volunteer/:volunteerId', function(req, res){
  bwipjs.toBuffer(
    {
      bcid: "qrcode", // Barcode type
      text: `{"type":"volunteer", "id":"${req.params.volunteerId}"}`, // Text to encode
      scale: 3,
      includetext: true, // Show human-readable text
      textxalign: "center",
      backgroundcolor: "ececec",
      padding: 3,
    },
    function (err, png) {
      if (err) {
        console.log(err);
      } else {
        const imgBase64 = png.toString("base64");
       
        return res.render("public/timetable/showQR", {
          qrCode: "data:image/png;base64," + imgBase64,
        });
      }
    }
  );
})
module.exports = router;
