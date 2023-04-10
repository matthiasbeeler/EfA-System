var nodemailer = require("nodemailer");
var ejs = require("ejs");
const transporter = nodemailer.createTransport({
  host: "mail.nyv.ch",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.emailUser, // generated ethereal user
    pass: process.env.emailPassword, // generated ethereal password
  },
});

exports.sendRegistrationMail = function (email) {
  const filename = process.cwd() + "/mailTemplates/registrationConfirmation.ejs";
  ejs.renderFile(filename, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      replyTo: "it@essenfueralle.org",
      subject: "Essen für Alle", // Subject line
      html: mailHTML,
      headers: {
        "List-Unsubscribe": "<mailto:unsubinfo@nyv.ch>",
      },
      list: {
        "List-Unsubscribe": "<mailto:unsubinfo@nyv.ch>",
        unsubscribe: {
          url: "<mailto:unsubinfo@nyv.ch>",
        },
      },
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
        if (err) {
        }
      });
  });
 
};

exports.forgotPassword = function (email, verificationKey, name) {
  const filename = process.cwd() + "/mailTemplates/passwordReset.ejs";
  ejs.renderFile(filename,{url: "https://admin.essenfueralle.org/resetPassword/"+verificationKey, name: name}, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      replyTo: "it@essenfueralle.org",
      subject: "Essen für Alle Password zurücksetzung", // Subject line
      html: mailHTML,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
 
};

exports.timetableRegistration = function (request, timeArray,volunteerId,shiftName,location) {
  request.session.shiftName = shiftName
  const bwipjs = require('bwip-js');
  const filename = process.cwd() + "/mailTemplates/timetableRegistration.ejs";
  var timeFullArray = [];
  timeArray.forEach(element => {
    var splitTime = element.split('-')
    timeFullArray.push(splitTime[0], splitTime[1])
  });
  var shiftDuration = timeFullArray[0] +" - "+ timeFullArray[timeFullArray.length-1];
  bwipjs.toBuffer({
    bcid:        'qrcode',       // Barcode type
    text:         `{"type":"volunteer", "id":"${volunteerId}"}`,    // Text to encode
    scale:       6,   
                  // Bar height, in millimeters
    includetext: true,            // Show human-readable text
    textxalign:  'center',
    backgroundcolor: "FFFFFF",
    padding: 2,     // Always good to set this
}, function (err, png) {
  const qrCode = "data:image/png;base64,"+png.toString("base64");

  ejs.renderFile(filename,{shiftDuration: shiftDuration, request: request, qrCode: qrCode, qrUrl: "https://admin.essenfueralle.org/timetable/showQR/volunteer/"+volunteerId+"?loc="+location, loc:location}, (error, mailHTML) => {
    if(error) return console.log(error);
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: request.session.volunteerEmail, // List of recipients //email
      replyTo: "fwkoordi@essenfueralle.org",
      subject: "Essen für Alle Schichtplan", // Subject line
      html: mailHTML,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
})
 
};


exports.supportRequest = function (request, res) {
  const filename = process.cwd() + "/mailTemplates/supportRequest.ejs";
  ejs.renderFile(filename,{request: request}, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: "matthias@essenfueralle.org", // List of recipients //email
      replyTo: request.body.email,
      subject: "Essen für Alle Support Anfrage", // Subject line
      html: mailHTML,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (!err) {
          res.json({success: true})
        }else{
          res.json({success: false})

        }
      });
  });
 
};

exports.signOutEmail = function (request, res) {
  const filename = process.cwd() + "/mailTemplates/timetableSignOut.ejs";
  ejs.renderFile(filename,{request: request, shiftDuration: request.session.shiftTime}, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: request.session.volunteerEmail, // List of recipients //email
      replyTo: "fwkoordi@essenfueralle.org",
      subject: "Essen für Alle Abmeldung", // Subject line
      html: mailHTML,
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (!err) {
        }else{
          console.log(err)
        }
      });
  });
 
};
