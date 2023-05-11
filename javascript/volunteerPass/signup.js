const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

exports.signupPass = function (request, response, database) {
    try {
  var locationArray = ["Zürich Manegg", "Seewen SZ", "Chur"];
  let name = request.body.name;
  let email = request.body.email;
  let mainLocation = request.body.mainLocation;
  let password = request.body.password;
  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegexp.test(email))
    return response.json({
      success: false,
      message: "Please enter a valid e-mail address",
    });
  if (!locationArray.includes(mainLocation))
    return response.json({
      success: false,
      message: "Please choose a valid main location",
    });

  if (mainLocation && password && name && email) {
    database.query(
        "SELECT * FROM volunteers WHERE name LIKE ? AND email LIKE ?;",
        [`%${name}%`, `%${email}`],
        function (error, results, fields) {
          if (results.length > 0) {
            var id = results[0].id;
            var newVolunteer = 0;
          } else {
            var id = uuidv4();
            var newVolunteer = 1;
          }
    database.query(
      `SELECT * FROM volunteerPasses WHERE email = ? OR id = ?`,
      [email, id],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          return response.json({
            success: false,
            message: "You already have an account or this e-mail address is already registered.",
          });
        } else {
           var now = Date.now();
              database.query(
                ` INSERT INTO volunteerPasses (id, email, fullName, password, emailVerified, lastLogin, createdAt, mainLocation)
            VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
                [
                    id,
                  email,
                  name,
                  crypto
                    .createHash("sha256")
                    .update(password + process.env.salt)
                    .digest("hex"),
                    0,
                    now,
                    now,
                    mainLocation


                ],
                function (error, results, fields) {
                  if (error) console.log(error);
                  if (error) return response.json({
                    success: false,
                    message: "An error occured whilst creating your account.",
                  });
                  var token = jwt.sign(
                    {
                      name: name,
                      email: email,
                      id: id,
                      createdAt: now,
                      mainLocation: mainLocation,
                      loggedin: true,
                    },
                    process.env.jwtSecret
                  );
                  response.cookie("EfAPassAuth", token, {
                    maxAge: 9999 * 60 * 60 * 1000,
                    httpOnly: false,
                    overwrite: true,
                  });
                  if(newVolunteer == 1){
                    database.query(
                        "INSERT INTO volunteers (`id`,`name`,`email`,`shifts`) VALUES(?,?,?,?)",
                        [
                          id,
                          name,
                          email,
                          "{}",
                        ],
                        function (error, results, fields) {
                            if (error) console.log(error);
                            return response.json({ success: true });

                        })
                  }else{
                    return response.json({ success: true });

                  }
                }
              );
            
        }
    }
    );
      }
    );
  } else {
    return response.json({
      success: false,
      message: "Please enter all details",
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
