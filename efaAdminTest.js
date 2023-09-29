var request = require("request");
const { error } = require("console");
const jwt = require("jsonwebtoken");

const entry = require("./javascript/entry");
const { database } = require("./javascript/db");
exports.test = function () {
  var errors = 0;
  database.query(`SELECT * FROM receivers;`, function (error, results, fields) {
    console.log(results)
    var token = jwt.sign(
      {
        username: "test",
        email: "test",
        permissions: {
          receiverRegistration: true,
          receiverMaintenance: true,
          entry: true,
          accounts: true,
          blocked: false,
          statistics: true,
          print: true,
          volunteers: true,
          sz: true,
          gr: true,
          zh: true,
          volunteerCards: true,
        },
        loggedin: true,
        location: "sz",
      },
      process.env.jwtSecret
    );
    if (error) return console.log(error);
    var length = results.length;
    var receivers = results;
    var array = [];
    var cardArray = [];
   // receivers.forEach((element, index) => {
      console.error("hi")
      setTimeout(() =>{
      length--;
      console.log(length)
      if (length > 0) {
        if (element.cardId == null) return;
        var req = {
          body: {
            id: element.cardId,
          },
        };
        //Set the cookie instead of setting into header
        var cookie = request.cookie("Auth="+token);

        // Set the headers for the request
        var headers = {
          Cookie: cookie,
        };
        // Configure the request
        var options = {
          url: "http://localhost:3000/admin/entry?key=" + process.env.jwtSecret,
          method: "POST",
          headers: headers,
          json: true,
          body: { id: element.cardId } ,
        };

        // Start the request
        request(options, function (error, response, body) {
            if(error) console.log(error);
            if(body.success == false) console.log(body.message)
            if(body.success == false && body.message !== "Karte wurde heute bereits eingetragen") {
              array.push("Error: "+ element.cardId + "Error: "+ body.message)
            }
            cardArray.push(element.cardId)
            if(index == 300){
              console.log(JSON.stringify(cardArray))
              console.log(JSON.stringify(array))
            }
            
            if(index > 530){
              console.log(JSON.stringify(cardArray))
              console.log(JSON.stringify(array))
            }
          if (!error && response.statusCode === 200) {
            // Print out the response body
          } else {
          }
        });

      }
    }, index*30)
    });
  });
};
