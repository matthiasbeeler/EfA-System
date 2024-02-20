var express = require("express");
const { database } = require("../javascript/db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require("libphonenumber-js");
const { register, searchSignOut, signOut, createNewShiftDate } = require("../javascript/timetable");
var router = express.Router();
const bwipjs = require("bwip-js");
const { supportRequest } = require("../javascript/mailer");

function getThreeDatesSz (){
  function isInThePast(date) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
 var saveSat = []
 var sat = ["2023-01-07","2023-01-21","2023-02-04","2023-02-18","2023-03-04","2023-03-18","2023-04-01","2023-04-15","2023-04-29","2023-05-13","2023-05-27","2023-06-10","2023-06-24","2023-07-08","2023-07-22","2023-08-05","2023-08-19","2023-09-02","2023-09-16","2023-09-30","2023-10-14","2023-10-28","2023-11-11","2023-11-25","2023-12-09","2023-12-23","2024-01-06","2024-01-20","2024-02-03","2024-02-17","2024-03-02","2024-03-16","2024-03-30","2024-04-13","2024-04-27","2024-05-11","2024-05-25","2024-06-08","2024-06-22","2024-07-06","2024-07-20","2024-08-03","2024-08-17","2024-08-31","2024-09-14","2024-09-28","2024-10-12","2024-10-26","2024-11-09","2024-11-23","2024-12-07","2024-12-21","2025-01-04","2025-01-18","2025-02-01","2025-02-15","2025-03-01","2025-03-15","2025-03-29","2025-04-12","2025-04-26","2025-05-10","2025-05-24","2025-06-07","2025-06-21","2025-07-05","2025-07-19","2025-08-02","2025-08-16","2025-08-30","2025-09-13","2025-09-27","2025-10-11","2025-10-25","2025-11-08","2025-11-22","2025-12-06","2025-12-20"]
  sat.forEach(function(element) {
    if(!isInThePast(new Date(element))) saveSat.push(element)
   });
saveSatFirstThree = saveSat.slice(0,3)
 var all = []
 saveSatFirstThree.forEach(element => {
  var split = element.split('-')
  all.push(split[2]+"."+split[1]+"."+split[0])
 });
 return all;
}

function getThreeDates() {
  var now  = new Date();
  if(now.getDay() == 6){
    now.setDate(now.getDate() + 1)
  }
  array = [];
  array.push(moment(now).day(6).format("DD.MM.YYYY"), moment(now).day(13).format("DD.MM.YYYY"), moment(now).day(20).format("DD.MM.YYYY"));
  return array;
}

router.get("/support", function (req, res) {
  res.render("public/timetable/supportForm");
});
router.post("/support", function (req, res) {
  supportRequest(req, res);
});

router.all("*", function(req,res, next){
  if(!req.session.timetableType){
    console.log("/timetable"+req.url, "/timetable"+req.url.replace('amp;',''))
    req.session.redirect = "/timetable"+req.url.replace('amp;','');
    return res.redirect("/timetable/pass?red=/timetable?red=true");
  } 
  next();
})

router.get("/",  function (req, res) {
  try {
  if(req.query.loc == "gr" || req.query.loc == "sz" || req.query.loc == "gl") req.session.location = req.query.loc;
  if(!req.session.location) req.session.location = "sz";
  var dates = getThreeDates();
  if(req.session.location == "sz"  || req.query.loc == "gl")dates = getThreeDatesSz();
  setTimeout(() => {
  if(!dates.includes(req.session.shiftDate)) req.session.shiftDate = dates[0]
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.session.shiftDate],
    function (error, results, fields) {
      var freeShifts = 0;
      if(!results) return res.redirect('/timetable/otherWeek')
      if(!results[0]) return res.redirect('/timetable/otherWeek')
      if(results[0].length <= 0) return res.redirect('/timetable/otherWeek')
      if(results[0]["shifts"+req.session.location] == null) return res.redirect('/timetable/otherWeek')
      results.forEach((element) => {
        element["shifts"+req.session.location].forEach((element) => {
          element.shifts.forEach((element) => {
            freeShifts = freeShifts + element.freeSpots;
          });
        });
      });
      var volEmail = "";
      var volName = "";
      if(req.session.volunteerEmail) volEmail = req.session.volunteerEmail;
      if(req.session.volunteerName) volName = req.session.volunteerName;
      if(req.session.timetableType == "pass") {
        volunteerData = jwt.verify(req.cookies.EfAPassAuth, process.env.jwtSecret);
        volEmail = volunteerData.email;
        volName = volunteerData.name;
      }
      res.render("public/timetable/home", {
        results: results,
        freeShifts: freeShifts,
        shiftDate: req.session.shiftDate,
        loc: req.session.location,
        volEmail: volEmail,
        volName: volName,
        timetableType: req.session.timetableType,
        redirect: req.session.redirect
      });
    }
  );
  
}, 1000);

    
} catch (error) {
    console.log(error)
    return res.redirect('/timetable/otherWeek')
}
});
router.post("/", function (req, res) {
  req.session.shiftId = req.body.shiftType;
  req.session.volunteerName = req.body.name;
  req.session.volunteerEmail = req.body.email;
  return res.json({ success: true });
});
router.get("/chooseTime", function (req, res) {
  if(req.query.loc == "gr" || req.body.loc == "sz"|| req.body.loc == "gl") req.session.location = req.query.loc;
  if(!req.session.location) req.session.location = "sz";
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
      results[0]["shifts"+req.session.location].forEach((element) => {
        if (element.id == req.session.shiftId) shift = element;
      });

      if (!shift.shifts) return res.redirect("/timetable");
      return res.render("public/timetable/chooseTime", {
        results: shift.shifts,
        shiftName: shift.shiftName,
        shiftDate: req.session.shiftDate,
        volunteerName: req.session.volunteerName,
        loc: req.session.location
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
          loc: req.session.location,
          timetableType: req.session.timetableType,

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
  if(req.query.loc == "gr" || req.query.loc == "sz" || req.query.loc == "gl") req.session.location = req.query.loc;
  if(!req.session.location) req.session.location = "sz";
  var dates = getThreeDates();
  if(req.session.location == "sz"  || req.session.location == "gl")dates = getThreeDatesSz();
  var redirect = "";
  if(req.session.redirect) redirect = req.session.redirect.replace("&amp;", "&");
  res.render("public/timetable/otherWeek", { dates: dates, nextDate: dates[0], redirect: redirect});
});
router.post("/chooseDate/", function (req, res) {
  if(req.session.location == "sz"  || req.session.location == "gl"){
    if (!getThreeDatesSz().includes(req.body.date)) return res.json({ success: false });
  }
  if(req.session.location == "gr"){
    if (!getThreeDates().includes(req.body.date)) return res.json({ success: false });
  }
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.body.date],
    function (error, results, fields) {
      if (!results.length > 0) return createNewShiftDate(req, res, database);
        if(results[0][["shifts"+req.session.location]] == null) return createNewShiftDate(req, res, database);
      req.session.shiftDate = req.body.date;
      return res.json({ success: true });
    }
  );
});

router.get("/signOut/", function (req, res) {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 6)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 45)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  if(!req.session.location) req.session.location = "sz"
  var result = result.map((m) => m.format("DD.MM.YYYY"));

  
    if(req.query.date){
      if (result.includes(req.query.date)) {req.session.shiftDate = req.query.date}else{
        req.session.redirect = "/timetable"+req.url.replace('date=','').replace('amp;','');
        return res.redirect('/timetable/otherWeek?red=true')
      }
    }
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
router.get("/location", function (req, res) {
  res.render('public/timetable/location')
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
          qrCode: "data:image/png;base64," + imgBase64, loc: req.query.loc
        });
      }
    }
  );
})
module.exports = router;
