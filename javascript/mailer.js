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
  const filename = __dirname + "./mailTemplates/registrationConfirmation.ejs";
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
