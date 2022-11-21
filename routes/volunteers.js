var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal } = require("../javascript/entry");
const  moment  = require("moment");
var router = express.Router();
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
        .volunteers == true
    )
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
function getThreeDatesSz (){
  function isInThePast(date) {
    const today = new Date();
    today.setDate(today.getDate() + 1);
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
router.get("/", function (req, res) {
  var location = jwt.verify(req.cookies.Auth, process.env.jwtSecret).location;
  dates = getThreeDatesSz()
 if(location !== "sz"){
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
    req.session.shiftDate = result[0];
 } else{
  req.session.shiftDate = dates[0];
 }
    database.query("SELECT * FROM volunteers;", function (error, results, fields) {
      var volunteerData = results;
      database.query("SELECT * FROM volunteerShifts WHERE date = ?;", [req.session.shiftDate], function (error, results, fields) {
        
          res.render("admin/volunteers", {session: req.session, volunteerData: JSON.stringify(volunteerData), shiftData: JSON.stringify(results[0]), location: location})
      })
    })
});

router.post('/checkIn', function(req, res){
  database.query("SELECT * FROM volunteers WHERE id = ?;",[req.body.id], function (error, results, fields) {
    if(error) console.log(error)
    if(error) return res.json({success: false, error: 1})
    if (!results.length > 0) return res.json({
        success: false,
        error: 2
      });
   const volunteerName = results[0].name;
    if(!results[0].shifts[req.session.shiftDate]) return res.json({success: false, error: 3})
    if(Object.keys(results[0].shifts[req.session.shiftDate]).length === 0) return res.json({success: false, error: 4})
    res.json({success: true, name: volunteerName, dateData: results[0].shifts[req.session.shiftDate]})
  })
})

module.exports = router;
