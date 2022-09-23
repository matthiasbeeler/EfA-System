var express = require('express');
const { login, register } = require('../javascript/auth');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
var router = express.Router();

router.all(["*"], function (req, res, next) {
  if(req.cookies.Auth){
    if(jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin) return res.redirect('/admin')
  }
  next()
})
router.get('/', function(req, res, next) {
  res.render('public/login');
});

router.post('/', function(req, res, next) {
  login(req, res, database)
});


router.get('/register', function(req, res, next) {
  res.render('public/register');
});

router.post('/register', function(req, res, next) {
  register(req,res, database)
});

module.exports = router;
