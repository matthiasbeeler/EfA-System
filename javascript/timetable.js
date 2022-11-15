const { v4: uuidv4 } = require("uuid");
const { timetableRegistration, signOutEmail } = require("./mailer");
const moment = require("moment");

exports.register = function (request, response, database) {
  try {
    if (!Array.isArray(request.body.timeCheck))
      request.body.timeCheck = [`${request.body.timeCheck}`];
    if (Array.isArray(request.body.timeCheck)) request.body.timeCheck.push("0");
    var timeArray = [];
    database.query(
      "SELECT * FROM volunteers WHERE name LIKE ? AND email LIKE ?;",
      [
        `%${request.session.volunteerName}%`,
        `%${request.session.volunteerEmail}%`,
      ],
      function (error, results, fields) {
        var uuid = uuidv4();
        if (results.length > 0) {
          var uuid = results[0].id;
        }
    database.query(
      "SELECT * FROM volunteerShifts WHERE date = ?;",
      [request.session.shiftDate],
      function (error, results, fields) {
        console.log(error)
        var shiftJson = results[0]["shifts"+request.session.location];
        var signedUpShifts = [];
        shiftName = "";
        request.body.timeCheck.forEach((e) => {
          if (e == 0) return;
          shiftJson.forEach((el) => {
            if (el.id !== request.session.shiftId) return;
            shiftName = el.shiftName;
            console.log(el)
            el["shifts"].forEach((element) => {
              if (element.smallShiftId !== e) return;
              var endFreeSpots = element.freeSpots - 1;
              element.freeSpots = endFreeSpots;
              element.volunteers[uuid] = false;
              console.log(element)
              signedUpShifts.push(`${element.shiftTime}`);
              timeArray.push(element.shiftTime);
            });
          });
        });
        database.query(
          "SELECT * FROM volunteers WHERE name LIKE ? AND email LIKE ?;",
          [
            `%${request.session.volunteerName}%`,
            `%${request.session.volunteerEmail}%`,
          ],
          function (error, results, fields) {
            if (results.length > 0) {
              var stopProcess = 0;
              timeArray.forEach((ele) => {
                if (ele == 0) return;
                console.log(ele)
                if(results[0].shifts == null) results[0].shifts = {}
                if(!results[0].shifts[request.session.shiftDate]) results[0].shifts[request.session.shiftDate] = {};
                if (results[0].shifts[request.session.shiftDate][ele]) stopProcess = 1;
                results[0]["shifts"][request.session.shiftDate][ele] = {
                  shiftName: shiftName,
                  location: request.session.location
                };
              });
              var volunteerId = results[0].id;
              if (stopProcess == 1) return response.json({ success: false });
              database.query(
                "UPDATE volunteers SET shifts = ? WHERE id = ?;",
                [JSON.stringify(results[0]["shifts"]), results[0].id],
                function (error, results, fields) {
                  if (error) console.log(error);
                  if (error) return response.json({ success: false });
                  database.query(
                    "UPDATE volunteerShifts SET shifts"+request.session.location+" = ? WHERE date = ?;",
                    [JSON.stringify(shiftJson), request.session.shiftDate],
                    function (error, results, fields) {
                      if (error) console.log(error);
                      if (error) return response.json({ success: false });
                      timetableRegistration(
                        request,
                        timeArray,
                        volunteerId,
                        shiftName,
                        request.session.location
                      );
                      if (!error)
                        return response.json({
                          success: true,
                          volunteerId: volunteerId,
                          location: request.session.location
                        });
                    }
                  );
                }
              );
            } else {
              var dateData = {};
              timeArray.forEach((ele) => {
                if (ele == 0) return;
                if (dateData[ele]) stopProcess = 1;
                dateData[request.session.shiftDate] = {};
                dateData[request.session.shiftDate][ele] = {
                  shiftName: shiftName,
                };
              });
              database.query(
                "INSERT INTO volunteers (`id`,`name`,`email`,`shifts`) VALUES(?,?,?,?)",
                [
                  uuid,
                  request.session.volunteerName,
                  request.session.volunteerEmail,
                  JSON.stringify(dateData),
                ],
                function (error, results, fields) {
                  if (error) console.log(error);
                  if (error) return response.json({ success: false });
                  database.query(
                    "UPDATE volunteerShifts SET shifts"+request.session.location+" = ? WHERE date = ?;",
                    [JSON.stringify(shiftJson), request.session.shiftDate],
                    function (error, results, fields) {
                      if (error) console.log(error);
                      if (error) return response.json({ success: false });
                      timetableRegistration(
                        request,
                        timeArray,
                        uuid,
                        shiftName
                      );
                      if (!error)
                        return response.json({
                          success: true,
                          volunteerId: uuid,
                        });
                    }
                  );
                }
              );
            }
          }
        );
      }
    );
  })

  } catch (error) {
    console.log(error);
    if (error) return response.json({ success: false });
  }
};

exports.searchSignOut = function (request, response, database) {
  try {
  var beforedate = new Date();
  var tomorrow = new Date();

  var start = moment(new Date().setDate(beforedate.getDate() - 7)), // Sept. 1st
    end = moment(new Date().setDate(tomorrow.getDate() + 21)), // Nov. 2nd
    day = 6; // Sunday
  var result = [];
  var current = start.clone();
  while (current.day(7 + day).isBefore(end)) {
    result.push(current.clone());
  }
  var result = result.map((m) => m.format("DD.MM.YYYY"));
  if(request.body.date){
    if (result.includes(request.body.date)) request.session.shiftDate = request.body.date;
  }
  
  database.query(
    "SELECT * FROM volunteers WHERE name LIKE ? AND email = ?;",
    [`%${request.body.name}%`, request.body.email],
    function (error, results, fields) {
      if (!results.length > 0) {
        response.json({ success: false });
      } else {
        request.session.volunteerName = results[0].name;
        request.session.volunteerEmail = request.body.email;
        response.json({ success: true, data: results });
      }
    }
  );
  
    
} catch (error) {
    console.log(error)
}
};

exports.signOut = function (request, response, database) {
  database.query(
    "SELECT * FROM volunteers WHERE name = ? AND email = ?;",
    [request.session.volunteerName, request.session.volunteerEmail],
    function (error, results, fields) {
      if (error) console.log(error);
      if (error) return response.json({ success: false });
      if (!results.length > 0) {
        response.json({ success: false });
      } else {
        var location =  results[0].shifts[request.session.shiftDate][request.body.shiftTime].location;
        delete results[0].shifts[request.session.shiftDate][
          request.body.shiftTime
        ];
        var volunteerShifts = results[0]["shifts"+request.session.location];
        var volunteerId = results[0].id;
        database.query(
          "SELECT * FROM volunteerShifts WHERE date = ? ;",
          [request.session.shiftDate],
          function (error, results, fields) {
            if (error) console.log(error);
            if (error) return response.json({ success: false });
            results[0]["shifts"+location].forEach((element) => {
              if (element.shiftName !== request.body.shiftName) return;
              element["shifts"].forEach((detailShift) => {
                if (detailShift.shiftTime !== request.body.shiftTime) return;
                detailShift.freeSpots = Number(detailShift.freeSpots)+1;
                delete detailShift.volunteers[volunteerId];
              });
            });
            var shiftData = results[0]["shifts"+location];
            database.query(
              "UPDATE volunteers SET shifts = ? WHERE id = ?;",
              [JSON.stringify(volunteerShifts), volunteerId],
              function (error, results, fields) {
                if (error) console.log(error);
                if (error) return response.json({ success: false });
                database.query(
                  "UPDATE volunteerShifts SET shifts"+location+" = ? WHERE date = ?;",
                  [JSON.stringify(shiftData), `${request.session.shiftDate}`],
                  function (error, results, fields) {
                    if (error) console.log(error);
                    if (error) return response.json({ success: false });
                    request.session.shiftTime = request.body.shiftTime;
                    request.session.shiftName = request.body.shiftName;
                    signOutEmail(request, response)
                    return response.json({ success: true, data: results });
                  }
                );
              }
            );
          }
        );
      }
    }
  );
};
