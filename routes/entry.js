var express = require('express');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require('libphonenumber-js');
const { normal } = require('../javascript/entry');
var router = express.Router();
router.all(["*"], function (req, res, next) {
    try {
      if (jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.entry == true) return next();
      res.redirect("/");
    } catch (error) {
      res.redirect("/");
    }
  });
router.get('/', function(req, res){
    res.render('admin/entry')
});

router.post('/', function(req, res){
  normal(req, res, database)
});

router.get('/cardForgotten', function(req, res){
  res.render('admin/cardForgotten')
});

router.get('/manualEntry', function(req, res){
  res.render('admin/manualEntry')
});

module.exports = router;
