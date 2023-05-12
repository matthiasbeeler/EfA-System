var validator = require("validator");
var special_chars = [
    "FROM",
    "DROP",
    "drop",
    "SELECT",
    "<",
    ">",
    "=",
    ";",
    "&",
    "'",
    "/",
  ];
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { passwordResetPassEmail } = require("../mailer");


exports.passwordForgotten = function (request, response, database) {
    if (!request.body.input) return response.json({ success: false, error: 1, message: "fields" });
    var input = request.body.input.trim().replace(/\s{2,}/g, " ");
    if (validator.isEmpty(input))
      return response.json({ success: false, error: 1, message: "Please fill out all fields" });
    if (!validator.isEmail(input)) return response.json({ success: false, error: 1, message: "Please enter your valid e-mail address." });
    if (new RegExp(special_chars.join("|")).test(input))
      return res.json({ success: false, error: 2, message: "invalid input"});
    database.query(
      `SELECT * FROM volunteerPasses WHERE email=?`,
      [input],
      function (err, results, fields) {
        if (err) console.log(err);
        if (err) return response.json({ success: false, error: 3 , message: "error"});
        if (results.length > 0) {
          const reset_token = jwt.sign(
            {
              id: results[0].id,
              name: results[0].fullName,
              email: results[0].email,
            },
            process.env.jwtSecret,
            { expiresIn: "20m" }
          );
          passwordResetPassEmail(results[0].email, reset_token, results[0].fullName);
          if (!err)
            return response.json({ success: true, action: "passwordreset" });
        } else {
          if (!err)
            return response.json({ success: true, action: "passwordreset" });
          if (err) console.log(err);
          if (err) return response.json({ success: false, error: 3, message: "error" });
        }
      }
    );
  };



  exports.resetForgottenPassword = function (request, response, database) {
    try {
      if (request.body.password !== request.body.passwordCheck)
        return response.json({
          success: false,
          error: 1,
          message: "Passwords don't match",
        });
      var test = new RegExp(
        "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
      );
  
      if (!test.test(request.body.password))
        return response.json({
          success: false,
          error: 2,
          message: "Please make sure that your password meets the criteria",
        });
      jwt.verify(
        request.body.token,
        process.env.jwtSecret,
        (err, result) => {
          if (err) console.log(err);
          if (err) return response.json({
              success: false,
              error: 3,
              message: "Token invalid",
            });
        }
      );
  
      var tokenData = jwt.verify(request.body.token, process.env.jwtSecret);
  
      database.query(
        "UPDATE volunteerPasses SET password = ? WHERE id = ? AND email = ?",
        [
            crypto.createHash("sha256").update(request.body.password + process.env.salt).digest("hex"),
          tokenData.id,
          tokenData.email,
        ],
        function (err, results, fields) {
          if (!err) return response.json({ success: true });
          if (err) console.log(err);
          if (err) return response.json({ success: false, error: 4, message: "An error occured." });
        }
      );
    } catch (error) {
      if (error) console.log(error);
      if (error) return response.json({ success: false, error: 4, message: "An error occured." });
    }
  };
  