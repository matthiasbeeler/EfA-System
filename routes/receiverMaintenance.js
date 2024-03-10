var express = require('express');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require('libphonenumber-js');
var router = express.Router();
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance == true)return next();
    res.redirect("/");
  } catch (error) {
    console.log(error)
    res.redirect("/");
  }
});

router.get("/", function (req, res, next) {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
      true
    )
      return res.redirect("/admin");
    database.query(
      `SELECT * FROM receivers;`,
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
        var receiverData = results;
        
        database.query(
          `SELECT * FROM receiversZemis WHERE receiverId = ?`,[req.params.id],
          function (error, results, fields) {
            var zemisData = results;
        database.query(
          `SELECT * FROM entryLogs WHERE id = ?`,[req.params.id],
          function (error, results, fields) {
            if (error) return res.redirect("/admin");
            res.render("admin/receiverMaintenanceSearch", { logResults: results, receiverData: receiverData, zemisData: JSON.stringify(zemisData) });
          }
        );
          })
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
        var receiverResults = results;
        if(!receiverResults[0].birthdate) receiverResults[0].birthdate = "xx.xx.xxxx"
        database.query(
          `SELECT * FROM entryLogs WHERE id = ?`,[req.params.id],
          function (error, results, fields) {
            if (error) return res.redirect("/admin");
            var logResults = results;
        database.query(
          `SELECT * FROM receiversZemis WHERE receiverId = ?`,[req.params.id],
          function (error, results, fields) {
            console.log(error)
        if (error) return res.redirect("/admin");
        res.render("admin/receiverMaintenanceEdit", {logResults: logResults, result: receiverResults, zemisData: JSON.stringify(results) });
      }
    );
      })
    })

  } catch (error) {
    console.log(error)
    return res.redirect("/admin/");
}
  });
  router.post("/:id/edit", function (req, res, next) {
    if (
        jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverMaintenance !==
        true
      )return res.redirect("/admin");

        var insertString = ""
        var searchstr = "";
        var passportNumber = "";
        var zemisCounter = Number(req.body.familyMembers.split(":")[1]) - 1;
        try{
          if(req.body.passportnumber){
            for (const key in req.body) {
              if (key.startsWith('passportnumber')) {
                var index = parseInt(key.slice('passportnumber'.length));
                if(!parseInt(key.slice('passportnumber'.length))) index = "";
                const passportNumber = req.body[key].toUpperCase().replace(/\s/g, "");
                const birthdateKey = `birthdate${index}`;
                const nameKey = `name${index}`;
                if (birthdateKey in req.body && nameKey in req.body) {
                  const birthdate = req.body[birthdateKey];
                  const name = req.body[nameKey].replace(/\b\w/g, (c) => c.toUpperCase());
                  if(passportNumber){
                    searchstr =
                      searchstr +
                      " zemisNr = '" +
                      passportNumber +
                      "' AND receiverId NOT LIKE '" +
                      req.params.id +
                      "' OR ";
                    };          
                    insertString =
                      insertString +
                      "('" +
                      req.params.id +
                      "','" +
                      passportNumber +
                      "','" +
                      name +
                      "','" +
                      birthdate +
                      "'),";
                }
              }
            }
      /*  function addZemis(num) {
          if (num == 0) num = "";
          if(req.body["passportnumber" + num] !== undefined && req.body["passportnumber" + num] !== ""){
          searchstr =
            searchstr +
            " zemisNr = '" +
            req.body["passportnumber" + num].toUpperCase().replace(/\s/g, "") +
            "' AND receiverId NOT LIKE '" +
            req.params.id +
            "' OR ";
          };

          if(req.body["passportnumber" + num]) req.body["passportnumber" + num] =req.body["passportnumber" + num].toUpperCase().replace(/\s/g, "")
          insertString =
            insertString +
            "('" +
            req.params.id +
            "','" +
            req.body["passportnumber" + num] +
            "','" +
            req.body["name" + num] +
            "','" +
            req.body["birthdate" + num] +
            "'),";

          passportNumber = passportNumber + req.body["passportnumber" + num];

          zemisCounter--;
          if (zemisCounter >= 0) addZemis(zemisCounter);
        }*/
        //if (zemisCounter >= 0) addZemis(zemisCounter);
        
        /*console.log(typeof req.body.passportnumber)
        if(typeof req.body.passportnumber == "string"){
          str = str + "('"+req.params.id+"','"+req.body.passportnumber+"'),";
          searchstr = searchstr + " zemisNr = '"+req.body.passportnumber+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + req.body.passportnumber;
        }else{
        req.body.passportnumber.forEach(element => {
          str = str + "('"+req.params.id+"','"+element+"'),"
          searchstr = searchstr + " zemisNr = '"+element+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + element;
        });
      }*/
      console.log(insertString)
      insertString = insertString.slice(0, insertString.length - 1)
        searchstr = searchstr.slice(0, searchstr.length - 3)
        var passportInsert =`INSERT INTO receiversZemis(receiverId, zemisNr, name, birthdate) VALUES ${insertString};`
      }else{
        var passportInsert =`SELECT 1`;
        var searchstr = "receiverId = 'x'"
      }
      
        var phone = parsePhoneNumber(req.body.phonenumber, "CH");
      database.query(
        `SELECT * FROM receivers WHERE phonenumber = ?`,[phone.number],
        function (error, results, fields) {
          if(error) console.log(error)
          if(error) return res.json({ success: false, message: "An error occured" });
          if (results[0] && results[0].id !== req.params.id) {
            return res.json({ success: false, receiverId: results[0].id });
          }else{
            database.query(
              `SELECT * FROM receiversZemis WHERE ${searchstr};`,
              function (error, results, fields) {
                if(error) console.log(error)
                      if(error) return res.json({ success: false, message: "An error occured" });
                if(results[0]) return res.json({ success: false, receiverId: results[0].receiverId });
                database.query(
                  `DELETE FROM receiversZemis WHERE receiverId = ?;`,[req.params.id],
                  function (error, results, fields) {
                  })
                  database.query(
                    `${passportInsert};`,
                    function (error, results, fields) {
                      if(error) console.log(error)
                      if(error) return res.json({ success: false, message: "An error occured" });
            database.query("UPDATE receivers SET phonenumber=?, passportType=?, passportNumber=?, birthdate=?, fullName=?, gender=?, familyMembers=?, postalCode=?, cardId=?, timeslot=?, entitlement=?, comment=?, blocked=?,activeRegistration=?,registrationLocation=?, paid=? WHERE id = ?",
            [
                phone.number,
                req.body.permit,
                req.body.passportnumber.toUpperCase().replace(/\s/g, "") ,
                req.body.birthdate,
                req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                req.body.gender,
                Number(req.body.familyMembers.split(":")[1]),
                req.body.postalcode,
                req.body.cardid,
                req.body.timeslot,
                req.body.entitlement,
                req.body.comment,
                req.body.blocked,
                1,
                jwt.verify(req.cookies.Auth, process.env.jwtSecret).location,
                req.body.paid,

                req.params.id,


              ],              function (error, results, fields) {
                if(error) console.log(error)
                      if(error) return res.json({ success: false, message: "An error occured" });
                if(!error) return res.json({ success: true});
              })
            })
          })
          }
        }
      );
      
    } catch (error) {
      console.log(error)
      if(error) return res.json({ success: false});
    }
    });
                

module.exports = router;
