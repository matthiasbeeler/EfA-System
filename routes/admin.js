var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken')

router.all(["*"], function (req, res, next) {
  try {
    console.log(jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin)
    if (jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin) return next()
      res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
router.get("/", function (req, res, next) {
  res.render("admin/home");
});




router.get('/logout', (req, res) => {
  res.clearCookie("Auth")
  res.redirect('/');
});

module.exports = router;
