var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const { database } = require("../javascript/db");
const { forgotPassword } = require("../javascript/mailer");

router.all(["*"], function (req, res, next) {
  try {
    if (jwt.verify(req.cookies.Auth, process.env.jwtSecret).loggedin)
      return next();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
});
router.get("/", function (req, res, next) {
  res.render("admin/home", {permissions: jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions, location: jwt.verify(req.cookies.Auth, process.env.jwtSecret).location});
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

router.post("/accounts/resetPassword", function (request, response, next) {
  try {
  database.query(
    "SELECT * FROM adminAccounts WHERE username=?",
    [
      request.body.username,
    ],
    function (err, results, fields) {
      if (results.length > 0){
        const reset_token = jwt.sign({ username: results[0].username, email: results[0].email }, process.env.jwtSecret, {expiresIn: '20m'})
        forgotPassword(results[0].email, reset_token, results[0].name)
        if(!err) return response.json({success: true})
        if(err) console.log(err)
        if(err) return response.json({success: false})
      }else{
        if(!err) return response.json({success: true})
        if(err) console.log(err)
        if(err) return response.json({success: false})

      }
      })
      
    
  } catch (error) {
    console.log(error)
    if(err) return response.json({success: false, message: error})
  }
})


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

router.get("/receiverRegistration", function (req, res, next) {
  if (
    jwt.verify(req.cookies.Auth, process.env.jwtSecret).permissions.receiverRegistration !==
    true
  )
    return res.redirect("/admin");

      return res.render("admin/receiverRegistration");
});

router.get("/logout", (req, res) => {
  res.clearCookie("Auth");
  res.redirect("/");
});

module.exports = router;
