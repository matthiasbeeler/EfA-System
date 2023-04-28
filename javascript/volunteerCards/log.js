exports.log = function (request, response, database) {
  try {
    if (!request.body.id) return response.json({ success: false });
    var id = request.body.id;
    var date = new Date().toLocaleDateString("de-CH");
    console.log(date, id);
    database.query(
      "SELECT * FROM volunteerCards WHERE id = ?;",
      [id, date],
      function (error, results, fields) {
        if (error) return response.json({ success: false });
        var volunteerData = results;
        if (!results.length > 0) return response.json({
          success: false,
          message: "Diese Karte wurde nicht gefunden.",
        });

        database.query(
          "SELECT * FROM volunteerCardsLog WHERE cardID = ? AND date = ?;",
          [id, date],
          function (error, results, fields) {
            if (error) return response.json({ success: false });
            var logResult = results;
            if (results.length > 0) {
              console.log()
              if (results[0].complete)
                return response.json({
                  success: false,
                  message: "Diese Person wurde heute bereits abgemeldet.",
                });
              database.query(
                "UPDATE volunteerCardsLog SET secondLog = ?, complete = ? WHERE cardID = ? AND date = ?;",
                [Date.now(), 1, id, date],
                function (error, results, fields) {
                  if (error) return response.json({ success: false });

                  var diff = Date.now() - logResult[0].firstLog;
                  diff = Math.floor(diff / 1000);
                  diff = Math.floor(diff / 60);
                  var mins_diff = diff % 60;
                  if (mins_diff < 10) mins_diff = "0" + String(mins_diff);
                  diff = Math.floor(diff / 60);
                  var hours_diff = diff % 24;
                  if (hours_diff < 10) hours_diff = "0" + String(hours_diff);
                  diff = Math.floor(diff / 24);
                  return response.json({
                    success: true,
                    name: volunteerData[0].name,
                    message: "Dauer: " + `${hours_diff}h ${mins_diff}min`,
                  });
                }
              );
            } else {
              database.query(
                "INSERT INTO volunteerCardsLog (firstLog, cardID, complete, date) VALUES(?,?,?,?);",
                [Date.now(), id, 0, date],
                function (error, results, fields) {
                  if (error) return response.json({ success: false });

                  return response.json({
                    success: true,
                    name: volunteerData[0].name,
                    message: "Checkin erfolgreich",
                  });
                }
              );
            }
          }
        );
      }
    );
  } catch (error) {
    console.log(error);
    if (error) return response.json({ success: false });
  }
};
