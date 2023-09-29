var request = require("request");
const { error } = require("console");

const entry = require("./javascript/entry");
const { database } = require("./javascript/db");
require("dotenv").config();
function consoleLog (text) { console.log(text) }

test("looping through all receiver entries", () => {
  var mysql = require("mysql2");
  var database = mysql.createConnection({
    connectionLimit: 50000,
    host: process.env.dbHost,
    user: process.env.dbUsername,
    password: process.env.dbPassword,
    database: "EfA",
    port: process.env.dbPort,
    insecureAuth: true,
  });
  var errors = 0;
  console.log(process.env.dbHost)
  database.query(`SELECT * FROM receivers;`, function (error, results, fields) {
    if (error) return console.log(error);
    process.stdout.write("hi")
    console.info("This is an error");
    consoleLog("hi");
    consoleLog(results);
    var length = results.length;

    var receivers = results;
    receivers.forEach((element) => {
      length--;
      console.log(length);
      var req = {
        body: {
          id: element.cardId,
        },
      };
      console.log(entry.normal(req, "", database));
      if (length == 0) {
        expect(Number(length)).toBe(2);
      }
    });
  });
});
