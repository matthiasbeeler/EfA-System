var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { database } = require("../javascript/db");

router.all(["*"], function (req, res, next) {
  try {
    console.log(jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin);
    if (jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin)
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
router.get("/", function (req, res, next) {
  res.render("admin/home", {permissions: jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions});
});

router.get("/accounts", function (req, res, next) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.accounts !==
    true
  )
    return res.redirect("/admin");
  database.query(
    `SELECT * FROM adminAccounts`,
    function (error, results, fields) {
      if (error) return res.redirect("/admin");
      res.render("admin/accounts", { results: results });
    }
  );
});

router.get("/accounts/:username", function (req, res, next) {
  try {
    
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.accounts !==
    true
  )
    return res.redirect("/admin");
    database.query(`SELECT * FROM adminAccounts where username = ?`,[req.params.username],function (error, results, fields) {
      if (error) return res.redirect("/admin");
      res.render("admin/accountEdit", { result: results });
    }
  );
  
} catch (error) {
  if (error) return res.redirect("/admin/accounts");

}
});

router.post("/accounts/save", function (req, res, next) {
  try {
  if (jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.accounts !== true)return res.json({success: false, error: 1});
    database.query(`UPDATE adminAccounts SET permissions = ? WHERE username = ?`,[req.body.permissions, req.body.username],function (error, results, fields) {
      if (error) return res.json({success: false, error:2});
      return res.json({success: true});
    }
  );
  
} catch (error) {
  console.log(error)
  if (error) return res.json({success: false, error: 3});

}
});

router.get("/logout", (req, res) => {
  res.clearCookie("Auth");
  res.redirect("/");
});

module.exports = router;
