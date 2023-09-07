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
      jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverRegistration == true)return next();
    res.redirect("/");
  } catch (error) {
    console.log(error)
    res.redirect("/");
  }
});
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
  if(error) return res.json({ success: false});
}
});

router.post('/', function(req, res, next){
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

        if (results && results[0]) {

          if (results[0].id !== req.body.id && results[0].activeRegistration==1) {
            return res.json({ success: false, receiverId: results[0].id });
          }else if(results[0].id !== req.body.id && results[0].activeRegistration==0){
            database.query(
              `DELETE FROM receivers WHERE id = ?;`,[results[0].id],
              function (error, result, fields) {console.log("Deleted: "+ results[0].id); next()});
          }else{
            next()

          } 
        
        }else{
          next()
        }
      
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return res.json({ success: false });
  }
})
router.post("/", function (req, res, next) {
  try {
  var phone = parsePhoneNumber(req.body.phonenumber, "CH");
  
  console.log(insertString)
        
          const date = new Date();
          console.log(req.body)

          var zemisCounter= Number(req.body.familyMembers.split(':')[1])-1;
          console.log(zemisCounter)
          let day = date.getDate();
          let month = date.getMonth() + 1;
          let year = date.getFullYear();
          let currentDate = `${day}.${month}.${year}`;
            if (req.body.id) {
              var insertString = ""
        var searchstr = "";
        var passportNumber = "";
      if(req.body.passportnumber){
        if(req.body.id) req.params.id = req.body.id;
          if(!req.body.id) req.params.id = "x";

          var passportNumber = "";
          function addZemis(num){
            var insertString = insertString + "('"+req.params.id+"','"+req.body["passportnumber"+num]+"','"+req.body["name"+num]+"','"+req.body["birthdate"+num]+"'),";
            zemisCounter--;
            if(zemisCounter > 0) addZemis(zemisCounter)
          }
          if(zemisCounter > 0) addZemis(zemisCounter)
          console.log(insertString);
          console.log(req.body)
        if(typeof req.body.passportnumber == "string"){
          insertString = insertString + "('"+req.params.id+"','"+req.body.passportnumber+"'),";
          searchstr = searchstr + " zemisNr = '"+req.body.passportnumber+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + req.body.passportnumber;
        }else{
        req.body.passportnumber.forEach(element => {
          
          insertString = insertString + "('"+req.params.id+"','"+element+"'),"
          searchstr = searchstr + " zemisNr = '"+element+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + element;
        });
      }
        insertString = insertString.slice(0, insertString.length - 1)
        searchstr = searchstr.slice(0, searchstr.length - 3)
        var passportInsert =`INSERT INTO receiversZemis(receiverId, zemisNr) VALUES ${insertString};`
      }else{
        var passportInsert =`SELECT 1`;
        var searchstr = "receiverId = 'x'"
      }
              database.query(
                `SELECT * FROM receiversZemis WHERE ${searchstr};`,
                function (error, results, fields) {
                  if(error) console.log(error)

                        if(error) return res.json({ success: false, message: "An error occured" });
                  if(results[0]) return res.json({ success: false, receiverId: results[0].receiverId });
                  database.query(
                    `DELETE FROM receiversZemis WHERE receiverId = ?;`,[req.params.id],
                    function (error, results, fields) {})
                    database.query(
                      `${passportInsert};`,
                      function (error, results, fields) {
                        if(error) console.log(error)
                        if(error) return res.json({ success: false, message: "An error occured" });
                        console.log(passportNumber)
              database.query(
                "UPDATE receivers SET ? WHERE ?",
                [
                  {
                    phonenumber: phone.number,
                    passportType: req.body.permit,
                    passportNumber: passportNumber,
                    birthdate: request.body.birthdate.split(".")[2]+"-"+request.body.birthdate.split(".")[1]+"-"+request.body.birthdate.split(".")[0],
                    fullName: req.body.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                    gender: req.body.gender,
                    familyMembers: Number(req.body.familyMembers.split(':')[1]),
                    postalCode: req.body.postalcode,
                    cardId: req.body.cardid,
                    entitlement: req.body.entitlement,
                    timeslot: req.body.timeslot,
                    comment: req.body.comment,
                    activeRegistration: 1,
                    registrationDate: currentDate,
                    registrationLocation: jwt.verify(req.cookies.Auth, process.env.jwtSecret).location,
                    paid: req.body.paid,
                  },
                  { id: req.body.id },
                ],
                function (error, results, fields) {
                  if (error) console.log(error)
                  if (error) return res.json({ success: false });
                  if (!error) return res.json({ success: true });
                }
              );
                      })
                    })
            } else {
              const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
              if (cyrillicPattern.test(req.body.name))req.body.name = transliterate(req.body.name);
              var uuid = uuidv4();
        
      if(req.body.passportnumber){
        var searchstr = "";
        var insertString = "";

        req.params.id = uuid;
        var passportNumber = "";
        function addZemis(num){
          if(num == 0) num ="";
           insertString = insertString + "('"+req.params.id+"','"+req.body["passportnumber"+num]+"','"+req.body["name"+num]+"','"+req.body["birthdate"+num]+"'),";
           searchstr = searchstr + " zemisNr = '"+req.body["passportnumber"+num]+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
           passportNumber = passportNumber + req.body["passportnumber"+num];

          zemisCounter--;
          if(zemisCounter >= 0) addZemis(zemisCounter)
        }
        if(zemisCounter >= 0) addZemis(zemisCounter)
        /*if(typeof req.body.passportnumber == "string"){
          insertString = insertString + "('"+req.params.id+"','"+req.body.passportnumber+"'),";
          searchstr = searchstr + " zemisNr = '"+req.body.passportnumber+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + req.body.passportnumber;
        }else{
        req.body.passportnumber.forEach(element => {
          
          insertString = insertString + "('"+req.params.id+"','"+element+"'),"
          searchstr = searchstr + " zemisNr = '"+element+"' AND receiverId NOT LIKE '"+req.params.id+"' OR "
          passportNumber = passportNumber + element;
        });
      }*/

        insertString = insertString.slice(0, insertString.length - 1)
        searchstr = searchstr.slice(0, searchstr.length - 3)
        var passportInsert =`INSERT INTO receiversZemis(receiverId, zemisNr, name, birthdate) VALUES ${insertString};`
      }else{
        var passportInsert =`SELECT 1`;
        var searchstr = "receiverId = 'x'"
      }
              database.query(
                `SELECT * FROM receiversZemis WHERE ${searchstr};`,
                function (error, results, fields) {
                  if(error) console.log(error)
                        if(error) return res.json({ success: false, message: "An error occured" });
                  if(results[0]) return res.json({ success: false, receiverId: results[0].receiverId });
                    database.query(
                      `${passportInsert};`,
                      function (error, results, fields) {
                        if(error) console.log(error)
                        if(error) return res.json({ success: false, message: "An error occured" });
              database.query(
                "INSERT INTO receivers (id, phonenumber,passportNumber, passportType, birthdate, fullName, gender, familyMembers, postalCode, cardId, timeslot, entitlement, comment, activeRegistration, registrationDate, registrationLocation,paid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                [
                  uuid,
                  phone.number,
                  passportNumber,
                  req.body.permit,

                  req.body.birthdate,
                  req.body.name,
                  req.body.gender,
                  Number(req.body.familyMembers.split(':')[1]),
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
                  if (error) console.log(error)
                  if (error) return res.json({ success: false });
                  if (!error) return res.json({ success: true });
                }
              );
                      })
                    })
          }

          
    
  } catch (error) {
    console.log(error)
  }
        
});

module.exports = router;
