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

exports.settingsPasswordChange = function (request, response, database) {
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
      var password = request.body.password;
    var jwtData = jwt.verify(request.cookies.EfAPassAuth, process.env.jwtSecret);
    database.query(
      `SELECT * FROM volunteerPasses WHERE  id = ? AND password = ?`,
      [
        jwtData.id,
        crypto
          .createHash("sha256")
          .update(password + process.env.salt)
          .digest("hex"),
      ],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          database.query(
            "UPDATE volunteerPasses SET password = ? WHERE id = ? AND email = ?",
            [
              crypto
                .createHash("sha256")
                .update(request.body.password + process.env.salt)
                .digest("hex"),
                jwtData.id,
                jwtData.email,
            ],
            function (err, results, fields) {
              if (!err) return response.json({ success: true });
              if (err) console.log(err);
              if (err)
                return response.json({
                  success: false,
                  error: 4,
                  message: "An error occured.",
                });
            }
          );
        }else{
            return response.json({
                success: false,
                error: 4,
                message: "Your current password isn't right.",
              });
        }
      }
    );
  } catch (error) {
    if (error) console.log(error);
    if (error)
      return response.json({
        success: false,
        error: 4,
        message: "An error occured.",
      });
  }
};


exports.updateImage = function (request, response, database) {
    try {
    const sharp = require('sharp');
    console.log(request.body)
    var jwtData = jwt.verify(request.cookies.EfAPassAuth, process.env.jwtSecret);
    var image = request.files.image;
    if(image.size > 5597152) return response.json({ success: false, message: "Your images size is too big" }); 
  sharp(image.data)
   .rotate()
    .webp({ quality:30, lossless: true })
    .toFile(process.cwd() + '/uploads/efaPassImages/' + jwtData.id+".webp", (err, info) => { console.log(err)});
  //image.mv(process.cwd() + '/public/uploads/profileImages/' + jwtData.id + fileType);

        return response.json({
          success: true,
        });

        
    } catch (error) {
        console.log(error)
        return response.json({ success: false, message: "An error occured" }); 
    }
  };
  