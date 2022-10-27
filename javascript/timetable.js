const { v4: uuidv4 } = require("uuid");
const { timetableRegistration } = require("./mailer");

exports.register = function (request, response, database) {
  try {
    if (!Array.isArray(request.body.timeCheck))
      request.body.timeCheck = [`${request.body.timeCheck}`];
    if (Array.isArray(request.body.timeCheck)) request.body.timeCheck.push("0");
    var timeArray = [];
    database.query(
      "SELECT shifts FROM volunteerShifts WHERE date = ?;",
      [request.session.shiftDate],
      function (error, results, fields) {
        var shiftJson = results[0].shifts
        var signedUpShifts = []
        shiftName = "";
        request.body.timeCheck.forEach((e) => {
          if (e == 0) return;
            shiftJson.forEach(el => {
                if(el.id !== request.session.shiftId) return;
                shiftName = el.shiftName
                el.shifts.forEach(element => {
                    if(element.smallShiftId !== e) return;
                    var endFreeSpots = element.freeSpots-1;
                    element.freeSpots = endFreeSpots;
                    signedUpShifts.push(`${element.shiftTime}`)
                    timeArray.push(element.shiftTime)
                });
            });
        });
        database.query(
          "SELECT * FROM volunteers WHERE name LIKE ? AND email LIKE ?;",
          [`%${request.session.volunteerName}%`,`%${request.session.volunteerEmail}%`],
          function (error, results, fields) {
            if(results.length > 0){
              var stopProcess = 0;
              timeArray.forEach((ele) => {
                if (ele == 0) return;
                if(results[0].shifts[request.session.shiftDate][ele]) stopProcess = 1;
                results[0].shifts[request.session.shiftDate][ele] = {
                  "shiftName":shiftName
                }
              })
              var volunteerId = results[0].id;
              if(stopProcess == 1) return response.json({success: false})
              database.query(
                "UPDATE volunteers SET shifts = ? WHERE id = ?;",
                [JSON.stringify(results[0].shifts), results[0].id],function (error, results, fields) {
                  if(error) console.log(error)
                  if(error) return response.json({success: false})
                  database.query(
                    "UPDATE volunteerShifts SET shifts = ? WHERE date = ?;",
                    [JSON.stringify(shiftJson), request.session.shiftDate],function (error, results, fields) {
                      if(error) console.log(error)
                      if(error) return response.json({success: false})
                      timetableRegistration(request, timeArray, volunteerId,shiftName)
                      if(!error) return response.json({success: true, volunteerId: volunteerId})
                    })
                })
            }else{
              var dateData = {}
              timeArray.forEach((ele) => {
                if (ele == 0) return;
                if(dateData[ele]) stopProcess = 1;
                console.log(ele)
                dateData[request.session.shiftDate] = {}
                dateData[request.session.shiftDate][ele] = {
                    "shiftName":shiftName
                }
              })
              var uuid = uuidv4();
              database.query(
                "INSERT INTO volunteers (`id`,`name`,`email`,`shifts`) VALUES(?,?,?,?)",
                [uuid, request.session.volunteerName, request.session.volunteerEmail,JSON.stringify(dateData)],function (error, results, fields) {
                  if(error) console.log(error)
                  if(error) return response.json({success: false})
                  database.query(
                    "UPDATE volunteerShifts SET shifts = ? WHERE date = ?;",
                    [JSON.stringify(shiftJson), request.session.shiftDate],function (error, results, fields) {
                      if(error) console.log(error)
                      if(error) return response.json({success: false})
                      timetableRegistration(request, timeArray, uuid,shiftName)
                      if(!error) return response.json({success: true, volunteerId: uuid})
                    })
                })
            }
          })
      }
    );
  } catch (error) {
    console.log(error);
    if(error) return response.json({success: false})
  }
};
