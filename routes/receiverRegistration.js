var express = require("express");
const { database } = require("../javascript/db");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { transliterate } = require("../javascript/transliterate");
const { parsePhoneNumber } = require("libphonenumber-js");
const jwt = require("jsonwebtoken");
router.all(["*"], function (req, res, next) {
  try {
    if (
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions
        .receiverRegistration == true
    )
      return next();
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});
router.post("/preReg", function (req, res, next) {
  try {
    database.query(
      "SELECT * FROM receivers WHERE id = ?;",
      [req.body.id],
      function (error, results, fields) {
        if (!results[0]) return res.json({ success: false });
        res.json({ success: true, results: results });
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return res.json({ success: false });
  }
});

router.post("/", function (req, res, next) {
  req.body.passportNumber = req.body.passportNumber.toUpperCase()
  console.log(req.body)
  try {
    var phone = parsePhoneNumber(req.body.phonenumber, "CH");
    database.query(
      "SELECT * FROM receivers WHERE phonenumber = ? OR passportNumber = ? OR fullName = ? AND birthdate = ? OR cardId = ?;",
      [
        phone.number,
        req.body.passportnumber,
        req.body.name,
        req.body.birthdate,
        req.body.cardid,
      ],
      function (error, results, fields) {
        if (results && results[0]) {
          if (
            results[0].id !== req.body.id &&
            results[0].activeRegistration == 1
          ) {
            if(req.body.cardid = results[0].cardId){
              return res.json({ success: false, message: "cardId", receiverId: results[0].id });
            }else{
              return res.json({ success: false, message:"nCardId", receiverId: results[0].id });
            }
            
          } else if (
            results[0].id !== req.body.id &&
            results[0].activeRegistration == 0
          ) {
            database.query(
              `DELETE FROM receivers WHERE id = ?;`,
              [results[0].id],
              function (error, result, fields) {
                console.log("Deleted: " + results[0].id);
                next();
              }
            );
          } else {
            next();
          }
        } else {
          next();
        }
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return res.json({ success: false });
  }
});
router.post("/", function (req, res, next) {

  try {
    var phone = parsePhoneNumber(req.body.phonenumber, "CH");

    const date = new Date();

    var zemisCounter = Number(req.body.familyMembers.split(":")[1]) - 1;
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}.${month}.${year}`;

      const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
      if (cyrillicPattern.test(req.body.name))
        req.body.name = transliterate(req.body.name);
      var uuid = uuidv4();

      if (req.body.passportnumber) {
        var searchstr = "";
        var insertString = "";

        req.params.id = uuid;
        var passportNumber = "";
        function addZemis(num) {
          req.body["passportnumber" + num].toUpperCase();
          if (num == 0) num = "";
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
          searchstr =
            searchstr +
            " zemisNr = '" +
            req.body["passportnumber" + num] +
            "' AND receiverId NOT LIKE '" +
            req.params.id +
            "' OR ";
          passportNumber = passportNumber.toUpperCase() + req.body["passportnumber" + num].toUpperCase();

          zemisCounter--;
          if (zemisCounter >= 0) addZemis(zemisCounter);
        }
        if (zemisCounter >= 0) addZemis(zemisCounter);
      

        insertString = insertString.slice(0, insertString.length - 1);
        searchstr = searchstr.slice(0, searchstr.length - 3);
        var passportInsert = `INSERT INTO receiversZemis(receiverId, zemisNr, name, birthdate) VALUES ${insertString};`;
      } else {
        var passportInsert = `SELECT 1`;
        var searchstr = "receiverId = 'x'";
      }
      database.query(
        `SELECT * FROM receiversZemis WHERE ${searchstr};`,
        function (error, results, fields) {
          if (error) console.log(error);
          if (error)
            return res.json({ success: false, message: "An error occured" });
          if (results[0])
            return res.json({
              success: false,
              receiverId: results[0].receiverId,
            });
          database.query(
            `${passportInsert};`,
            function (error, results, fields) {
              if (error) console.log(error);
              if (error)
                return res.json({
                  success: false,
                  message: "An error occured",
                });
              database.query(
                "INSERT INTO receivers (id, phonenumber,passportNumber, passportType, birthdate, fullName, gender, familyMembers, postalCode, cardId, timeslot, entitlement, comment, activeRegistration, registrationDate, registrationLocation,paid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  uuid,
                  phone.number,
                  req.body.passportnumber,
                  req.body.permit,
                  req.body.birthdate,
                  req.body.name,
                  req.body.gender,
                  Number(req.body.familyMembers.split(":")[1]),
                  req.body.postalcode,
                  req.body.cardid,
                  req.body.timeslot,
                  req.body.entitlement,
                  req.body.comment,
                  1,
                  currentDate,
                  jwt.verify(req.cookies.Auth, process.env.jwtSecret).location,
                  req.body.paid,
                ],
                function (error, results, fields) {
                  if (error) console.log(error);
                  if (error) return res.json({ success: false });
                  if (!error) return res.json({ success: true });
                }
              );
            }
          );
        }
      );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
