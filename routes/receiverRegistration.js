var express = require("express");
const { database } = require("../javascript/db");
var router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { transliterate } = require("../javascript/transliterate");
const { parsePhoneNumber } = require("libphonenumber-js");

router.post("/preReg", function (req, res, next) {
  try{
  database.query(
    "SELECT * FROM receivers WHERE id = ?;",
    [req.body.id],
    function (error, results, fields) {
      if (!results[0]) return res.json({ success: false });
      res.json({ success: true, results: results });
    }
  );
} catch (error) {
  console.log(error)
  if(!error) return res.json({ success: false});
}
});

router.post("/", function (req, res, next) {
  try {
    var phone = parsePhoneNumber(req.body.phonenumber, "CH");
    database.query(
      "SELECT * FROM receivers WHERE phonenumber = ? OR passportNumber = ? OR fullName = ? AND birthdate = ? OR cardId = ?;",
      [
        phone.number,
        req.body.passportnumber,
        req.body.name,
        req.body.birthdate,
        req.body.cardid
      ],
      function (error, results, fields) {

        if (results[0]) {
          if (results[0].id !== req.body.id) {

            return res.json({ success: false, receiverId: results[0].id });
          } 
        }else{
          const date = new Date();
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let currentDate = `${day}.${month}.${year}`;
            if (req.body.id) {
              database.query(
                "UPDATE receivers SET ? WHERE ?",
                [
                  {
                    phonenumber: phone.number,
                    passportType: req.body.permit,
                    passportNumber: req.body.passportnumber.toUpperCase(),
                    birthdate: req.body.birthdate.split("-").reverse().join("."),
                    fullName: req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                    gender: req.body.gender,
                    familyMembers: req.body.familymembers,
                    postalCode: req.body.postalcode,
                    cardId: req.body.cardid,
                    entitlement: req.body.entitlement,
                    timeslot: req.body.timeslot,
                    comment: req.body.comment,
                    activeRegistration: 1,
                    registrationDate: currentDate
                  },
                  { id: req.body.id },
                ],
                function (error, results, fields) {
                  if (error) return res.json({ success: false });
                  if (!error) return res.json({ success: true });
                }
              );
            } else {
              const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
              if (cyrillicPattern.test(req.body.name))req.body.name = transliterate(req.body.name);
              var uuid = uuidv4();
              database.query(
                "INSERT INTO receivers (id, phonenumber, passportType, birthdate, fullName, gender, familyMembers, postalCode, cardId, timeslot, entitlement, comment, activeRegistration, registrationDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  uuid,
                  phone.number,
                  req.body.permit,
                  req.body.birthdate.split("-").reverse().join("."),
                  req.body.name,
                  req.body.gender,
                  req.body.familymembers,
                  req.body.postalcode,
                  req.body.cardid,
                  req.body.timeslot,
                  req.body.entitlement,
                  req.body.comment,
                  1,
                  currentDate
                ],
                function (error, results, fields) {
                  if (error) return res.json({ success: false });
                  if (!error) return res.json({ success: true });
                }
              );
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return res.json({ success: false });
  }
});

module.exports = router;
