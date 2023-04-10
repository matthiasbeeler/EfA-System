const jwt = require("jsonwebtoken");

exports.normal = function (req, res, database) {
  try {
    if (!req.body.id && !/^-?\d+$/.test(req.body.id))
      return res.json({
        success: false,
        message: "Die Eingabe wurde nicht angenommen",
      });
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}.${month}.${year}`;
    const time = new Date()
      .toLocaleString("de-CH", {
        timeZone: "Europe/Zurich",
      })
      .split(", ")[1];
    database.query(
      `SELECT * FROM receivers WHERE  cardId = ?`,
      [req.body.id],
      function (error, results, fields) {
        if (!results.length > 0) {
          return res.json({
            success: false,
            message: "Diese Karte existiert im System nicht",
          });
        } else {
          if(results[0].blocked !== 0) return res.json({
            success: false,
            message: "Karte blockiert. Kommentar: "+results[0].comment,
          });
          var entitlement = results[0].entitlement;
          var id = results[0].id;
          var comment = results[0].comment;
          if(results[0].paid !== 1) comment = comment + " Noch nicht bezahlt."
          database.query(
            `SELECT * FROM entryLogs WHERE  id = ? and date = ?`,
            [id, currentDate],
            function (error, results, fields) {
              if (results.length > 0) {
                res.json({
                  success: false,
                  message: "Karte wurde heute bereits eingetragen",
                });
              } else {
                database.query(
                  `INSERT INTO entryLogs (id, logTime, entitlement, cardId, date,logLocation)
        VALUES (?, ?, ?, ?, ?,?)`,
                  [id, time, entitlement, req.body.id, currentDate, jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
                  function (error, results, fields) {
                    if (!error) return res.json({ success: true, comment: comment });
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Es gab einen Fehler" });
  }
};

exports.cardForgotten = function (req, res, database) {
  try {
    if (!req.body.entitlement)
      return res.json({
        success: false,
        message: "Die Eingabe wurde nicht angenommen",
      });
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}.${month}.${year}`;
    const time = new Date()
      .toLocaleString("de-CH", {
        timeZone: "Europe/Zurich",
      })
      .split(", ")[1];
    var entitlement = req.body.entitlement;
    database.query(
      `INSERT INTO entryLogs (id, logTime, entitlement, cardId, date, logLocation)
        VALUES (?, ?, ?, ?, ?,?)`,
      [null, time, entitlement, null, currentDate, jwt.verify(req.cookies.Auth, process.env.jwtSecret).location],
      function (error, results, fields) {
        if(error) console.log(error)
        if (!error) return res.json({ success: true });
      }
    );
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Es gab einen Fehler" });
  }
};
