var express = require('express');
const { login, register, resetPassword } = require('../javascript/auth');
const { database } = require('../javascript/db');
const jwt = require("jsonwebtoken");
var router = express.Router();
var bouncer = require ("express-bouncer")(300000, 9000000, 7);
 
bouncer.whitelist.push ("127.0.0.1");
bouncer.blocked = function (req, res, next, remaining)
{
    res.json({success: false, message: "Es wurden zu viele Anfragen gesendet. Bitte warte " + Math.round(remaining / 1000 / 60) + " Minuten"});
};
router.all(["/", "/register"], function (req, res, next) {
  try {
  if(req.cookies.Auth){
    if(jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin) return res.redirect('/admin')
  }
  if(!req.cookies.Auth){
    if(!jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin) return next()
  }
  
    
} catch (error) {
    next()
}
setInterval(function () {
  database.query('SELECT 1');
}, 10000);

})
router.get('/', function(req, res, next) {
  res.render('public/login');
});

router.post('/',bouncer.block, function(req, res, next) {
  login(req, res, database,bouncer)
});


router.get('/register', function(req, res, next) {
  res.render('public/register');
});

router.post('/register', function(req, res, next) {
  register(req,res, database)
});


router.get('/resetPassword/:token', function(req, res, next) {
  res.render('public/resetPassword', {token: req.params.token});
});

router.post('/resetPassword/', function(req, res, next) {
  resetPassword(req, res, database)
});



module.exports = router;
