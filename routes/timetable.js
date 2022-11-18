var express = require("express");
const { database } = require("../javascript/db");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require("libphonenumber-js");
const { register, searchSignOut, signOut } = require("../javascript/timetable");
var router = express.Router();
const bwipjs = require("bwip-js");
const { supportRequest } = require("../javascript/mailer");

function getThreeDatesSz (){
  function isInThePast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
  
 function getFirstMonth(){
  var d = new Date();
  var getTot = daysInMonth(d.getMonth()+1,d.getFullYear()); //Get total days in a month
  var sat = new Array();   //Declaring array for inserting Saturdays
  var firstSat = [];
  for(var i=1;i<=getTot;i++){    //looping through days in month
      var newDate = new Date(d.getFullYear(),d.getMonth(),i)
      if(newDate.getDay()==6){   //if Saturday
        if(i < 10) i = String(i)
        sat.push(String(d.getFullYear())+"-"+String(d.getMonth()+1)+"-"+String(i));
      }
  
  }
  sat.forEach(function(element) {
    if(!isInThePast(new Date(element)) && sat.indexOf(element) == 0 || !isInThePast(new Date(element)) && sat.indexOf(element) == 2) firstSat.push(element)
   });
  return firstSat;
  function daysInMonth(month,year) {
      return new Date(year, month, 0).getDate();
  }
 }
 function getSecondMonth(){
  var d = new Date();
  var getTot = daysInMonth(d.getMonth()+2,d.getFullYear()); //Get total days in a month
  var sat = new Array();   //Declaring array for inserting Saturdays
  var secondSat = [];
  for(var i=1;i<=getTot;i++){    //looping through days in month
      var newDate = new Date(d.getFullYear(),d.getMonth()+1,i)
      if(newDate.getDay()==6){   //if Saturday
        if(i < 10) i = "0"+String(i)
        
        sat.push(String(d.getFullYear())+"-"+String(d.getMonth()+2)+"-"+String(i));
      }
  
  }
  sat.forEach(function(element) {
    if(!isInThePast(new Date(element)) && sat.indexOf(element) == 0 || !isInThePast(new Date(element)) && sat.indexOf(element) == 2) secondSat.push(element)
   });
  return secondSat;
  function daysInMonth(month,year) {
      return new Date(year, month, 0).getDate();
  }
 }
 var first = getFirstMonth()
 var second = getSecondMonth()
 var all = []
 second.forEach(element => {
  first.push(element)
 });
 first.forEach(element => {
  var split = element.split('-')
  all.push(split[2]+"."+split[1]+"."+split[0])
 });
 return all;
}
getThreeDatesSz()
router.get("/",  function (req, res) {
  dates = getThreeDatesSz()
  setTimeout(() => {

  if(req.query.loc == "gr" || req.body.loc == "sz") req.session.location = req.query.loc;
  if(!req.session.location) req.session.location = "sz";
  if(!dates.includes(req.session.shiftDate)) req.session.shiftDate = dates[0]
  database.query(
    "SELECT * FROM volunteerShifts WHERE date = ?;",
    [req.session.shiftDate],
    function (error, results, fields) {
      var freeShifts = 0;
      results.forEach((element) => {
        element["shifts"+req.session.location].forEach((element) => {
          element.shifts.forEach((element) => {
            freeShifts = freeShifts + element.freeSpots;
          });
        });
      });
      res.render("public/timetable/home", {
        results: results,
        freeShifts: freeShifts,
        shiftDate: req.session.shiftDate,
        loc: req.session.location
      });
    }
  );
  
}, 1000);
});
router.post("/", function (req, res) {
  req.session.shiftId = req.body.shiftType;
  req.session.volunteerName = req.body.name;
  req.session.volunteerEmail = req.body.email;
  return res.json({ success: true });
});
router.get("/chooseTime", function (req, res) {
  if(req.query.loc == "gr" || req.body.loc == "sz") req.session.location = req.query.loc;
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
          loc: req.session.location
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
  
  res.render("public/timetable/otherWeek", { dates: getThreeDatesSz() });
});
router.post("/chooseDate/", function (req, res) {
  
  if (!getThreeDatesSz().includes(req.body.date)) return res.json({ success: false });
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
