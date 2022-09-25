var express = require("express");
var router = express.Router();
const translatte = require("translatte");
var phoneFormatter = require('libphonenumber-js');
const {
  form
} = require("../translations");
require("dotenv").config();
const {
  all_plz
} = require("../plz_schweiz");
const { database } = require("../javascript/db");
const { v4: uuidv4 } = require('uuid');
const { transliterate } = require("../javascript/transliterate");

const db = database;
/*
router.all('/*', function(req, res, next){
  var myDate = new Date();
  if (myDate.getDay() !== 6) {
    res.redirect("https://www.essenfueralle.org")
  }else{
    if(myDate.getHours() < 9 || myDate.getHours() > 19){
      res.redirect("https://www.essenfueralle.org")
    }else{
      next()
    }
  };
})
*/
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("public/preReg/index");
});

async function translate(text, lang) {
  return new Promise((resolve, reject) => {
    translatte(text, {
        to: lang
      })
      .then((response) => {
        var text = response.text;
        resolve(text);
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

router.get("/form", function (req, res, next) {
  var lang_array = ["en", "uk", "de", "fr", "ku", "ar", "fa", "es"];
  var lang = req.query.lang;
  if (!lang_array.includes(lang)) return res.redirect("/");
  return res.render("public/preReg/form", {
    text: form[0][lang]
  });
});

router.post('/qr', function (req, res, next) {
  try {
  
  var success = false
  all_plz.forEach(element => {
    if (req.body.house == element.plz + " - " + element.ort + " - " + element.kanton) success = true;
  });
  if (success !== true) return res.json({
    success: false,
    error: "addr"
  })
  const cyrillicPattern = /^\p{Script=Cyrillic}+$/u;
  if(cyrillicPattern.test(req.body.name)) req.body.name = transliterate(req.body.name)
  var name = req.body.name;
  var uuid = uuidv4();
  //decode
  //Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')
  var phone = phoneFormatter.parsePhoneNumber(req.body.phone, "CH");
    db.query("SELECT * FROM receivers WHERE phonenumber = ?;", [phone.number], function (error, results, fields) {
      if (results.length > 0) return res.json({
        success: false,
        error: "phone"
      })
    db.query("INSERT INTO receivers (id, fullName, phonenumber, passportType, familyMembers, postalCode, gender) VALUES (?, ?,?,?,?,?,?)", [uuid, req.body.name, phone.number, req.body.aus, req.body.people, req.body.house, req.body.gend], function (error, results, fields) {
      if(error) return console.log(error)
      return res.json({
        success: true,
        jwt: uuid,
        name: name
      })
    })
  })
    
} catch (error) {
    console.log(error)
}
})

router.get("/qr/:id", function (req, res, next) {
  return res.render("public/preReg/qr", {
    jwt: req.params.id,
    name: req.query.name
  });
});


module.exports = router;

//to add new languag:
/*text_array.forEach((element) => {
    translate(element.text, lang).then((result) => {
      element.text = result;
      text.push(result)
      console.log(text_array)
      if (text.length == 11) return
    });
  });
*/