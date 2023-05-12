const crypto = require("crypto");
const jwt = require("jsonwebtoken");

exports.loginPass = function (request, response, database, bouncer) {
    try {
    let email = request.body.input;
    let password = request.body.password;
    if (email && password) {
      database.query(
        `SELECT * FROM volunteerPasses WHERE  email = ? AND password = ?`,
        [email, crypto.createHash("sha256").update(password + process.env.salt).digest("hex")],
        function (error, results, fields) {
          if (error) throw error;
          if (results.length > 0) {
            var token = jwt.sign(
              {
                name: results[0].fullName,
                email: results[0].email,
                id: results[0].id,
                createdAt: results[0].createdAt,
                mainLocation: results[0].mainLocation,
                loggedin: true,
              },
              process.env.jwtSecret
            );
            response.cookie("EfAPassAuth", token, {
              maxAge: 9999 * 60 * 60 * 1000,
              httpOnly: false,
              overwrite: true,
            });
            request.session.timetableType = "pass";
            
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
        message: "Please enter e-mail address and Password!",
      });
    }
} catch (error) {
    console.log(error)
    if (error) return response.json({
        success: false,
        message: "An error occured whilst creating your account.",
      });
}
  };