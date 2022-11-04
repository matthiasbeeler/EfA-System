var express = require("express");
const { database } = require("../javascript/db");
const jwt = require("jsonwebtoken");
const { normal } = require("../javascript/entry");
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
router.get("/", function (req, res) {
  
          res.render("admin/volunteers")
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
    if(!results[0].shifts["05.11.2022"]) return res.json({success: false, error: 3})
    if(Object.keys(results[0].shifts["05.11.2022"]).length === 0) return res.json({success: false, error: 4})
    res.json({success: true, name: volunteerName, dateData: results[0].shifts["05.11.2022"]})
  })
})

module.exports = router;
