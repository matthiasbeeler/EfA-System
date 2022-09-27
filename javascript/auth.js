const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendRegistrationMail } = require("./mailer");

exports.login = function (request, response, database) {
  let username = request.body.username;
  let password = request.body.password;
  if (username && password) {
    var searchVal = "username";
    if (username.includes("@")) var searchVal = "email";
    database.query(
      `SELECT * FROM adminAccounts WHERE  ${searchVal} = ? AND password = ?`,
      [username, crypto.createHash("sha256").update(password).digest("hex")],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          results[0].permissions = JSON.parse(results[0].permissions)
          if(results[0].permissions.blocked) return response.json({
            success: false,
            message: "Please contact an administrator to activate your account",
          });
          var token = jwt.sign(
            {
              username: results[0].username,
              email: results[0].email,
              permissions: results[0].permissions,
              loggedin: true,
            },
            process.env.jwtSecret
          );
          response.cookie("Auth", token, {
            maxAge: 9999 * 60 * 60 * 1000,
            httpOnly: false,
            overwrite: true,
          });
          return response.json({ success: true });
        } else {
          return response.json({
            success: false,
            message: "Incorrect Username and/or Password!",
          });
        }
      }
    );
  } else {
    return response.json({
      success: false,
      message: "Please enter Username and Password!",
    });
  }
};

exports.register = function (request, response, database) {
  let username = request.body.username;
  let name = request.body.name;
  let email = request.body.email;
  let password = request.body.password;
  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegexp.test(email))
    return response.json({
      success: false,
      message: "Please enter a valid e-mail address",
    });
  if (username.includes("@"))
    return response.json({
      success: false,
      message: "The username shouldn't include any symbols",
    });

  if (username && password && name && email) {
    if (username.includes("@")) var searchVal = "email";
    database.query(
      `SELECT * FROM adminAccounts WHERE  username = ? OR email = ?`,
      [username, email],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          return response.json({
            success: false,
            message: "User with e-mail / username already exists",
          });
        } else {
          let permissions = {};
          permissions.receiverRegistration = false;
          permissions.receiverMaintenance = false;
          permissions.entry = false;
          permissions.accounts = false;
          permissions.blocked = true;
          database.query(
            ` INSERT INTO adminAccounts (username, email, name, password, permissions)
          VALUES (?, ?, ?, ?, ?)`,
            [
              username,
              email,
              name,
              crypto.createHash("sha256").update(password).digest("hex"),
              JSON.stringify(permissions),
            ],
            function (error, results, fields) {
              if (error) console.log(error);
              sendRegistrationMail(email)
              return response.json({ success: true });

            }
          );
        }
      }
    );
  } else {
    return response.json({
      success: false,
      message: "Please enter all details",
    });
  }
};
