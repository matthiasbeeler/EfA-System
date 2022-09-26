var express = require('express');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require('libphonenumber-js');
var router = express.Router();


router.get("/", function (req, res, next) {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
      true
    )
      return res.redirect("/admin");
    database.query(
      `SELECT * FROM receivers`,
      function (error, results, fields) {
        if (error) return res.redirect("/admin");
        res.render("admin/receiverMaintenance", { results: results });
      }
    );
  });
  
  router.get("/:id", function (req, res, next) {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
      true
    )
      return res.redirect("/admin");
      try {
    database.query(
      `SELECT * FROM receivers WHERE id = ?`,[req.params.id],
      function (error, results, fields) {
        if (error) return res.redirect("/admin");
        var receiverData = results
        database.query(
          `SELECT * FROM entryLogs WHERE id = ?`,[req.params.id],
          function (error, results, fields) {
            if (error) return res.redirect("/admin");
            res.render("admin/receiverMaintenanceSearch", { logResults: results, receiverData: receiverData });
          }
        );
      }
    );
    
        
  } catch (error) {
        console.log(error)
        return res.redirect("/admin/");
  }
  });

  router.get("/:id/edit", function (req, res, next) {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
      true
    )
      return res.redirect("/admin");
      try{
    database.query(
      `SELECT * FROM receivers WHERE id = ?`,[req.params.id],
      function (error, results, fields) {
        if (error) return res.redirect("/admin");
        res.render("admin/receiverMaintenanceEdit", { result: results });
      }
    );
  } catch (error) {
    console.log(error)
    return res.redirect("/admin/");
}
  });
  router.post("/:id/edit", function (req, res, next) {
    if (
        jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
        true
      )
        return res.redirect("/admin");
        try{
        var phone = parsePhoneNumber(req.body.phonenumber, "CH");
      database.query(
        `SELECT * FROM receivers WHERE phonenumber = ? OR passportNumber = ?`,[phone.number, req.body.passportnumber],
        function (error, results, fields) {
          if (error) return res.redirect("/admin");
          if (results[0] && results[0].id !== req.params.id) {
            return res.json({ success: false, receiverId: results[0].id });
          }else{
            console.log(req.body.blocked)
            database.query("UPDATE receivers SET phonenumber=?, passportType=?, birthdate=?, fullName=?, gender=?, familyMembers=?, postalCode=?, cardId=?, timeslot=?, entitlement=?, comment=?, blocked=? WHERE id = ?",
            [
                phone.number,
                req.body.permit,
                req.body.birthdate,
                req.body.name,
                req.body.gender,
                req.body.familymembers,
                req.body.postalcode,
                req.body.cardid,
                req.body.timeslot,
                req.body.entitlement,
                req.body.comment,
                req.body.blocked,
                req.params.id
              ],              function (error, results, fields) {
                if(!error) return res.json({ success: true});
              })

          }
        }
      );
    } catch (error) {
      console.log(error)
      if(!error) return res.json({ success: false});
    }
    });
                

module.exports = router;
