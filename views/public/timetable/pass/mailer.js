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

exports.otpEmail = function(code, email){
  try {
    const filename = process.cwd() + "/emailTemplates/mfa.ejs";
  ejs.renderFile(filename,{code: code}, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "Your code is: "+code, // Subject line
      html: mailHTML,
      text: "Your verification code is: "+code
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (!err) {
          return true
        }else{
            console.log(err)
          return false
        }
      });
  });
  
} catch (error) {
    console.log(error)
    return false
}
}


exports.verificationEmail = function(code, email){
  try {
    const filename = process.cwd() + "/emailTemplates/verifyEmail.ejs";
  ejs.renderFile(filename,{code: code}, (error, mailHTML) => {
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "Your code is: "+code, // Subject line
      html: mailHTML,
      text: "Your verification code is: "+code
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (!err) {
          return true
        }else{
            console.log(err)
          return false
        }
      });
  });
  
} catch (error) {
    console.log(error)
    return false
}
}

exports.passwordReset = function (email, verificationKey) {
  const filename = process.cwd() + "/emailTemplates/passwordReset.ejs";
  ejs.renderFile(filename,{resetLink: "https://app.afrocamoney.com/resetPassword/"+verificationKey}, (error, mailHTML) => { 
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "Afrocamoney password reset", // Subject line
      html: mailHTML,
      text: "Reset your password with the following link: "+"https://app.afrocamoney.com/resetPassword/"+verificationKey
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
 
};

exports.idAccepted = function (email, verificationKey) {
  const filename = process.cwd() + "/emailTemplates/idAccepted.ejs";
  ejs.renderFile(filename, (error, mailHTML) => { 
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "ID verification successful", // Subject line
      html: mailHTML,
      text: "You may log in using the following link: "+"https://app.afrocamoney.com/logout/"
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
 
};

exports.idDeclined = function (email, verificationKey) {
  const filename = process.cwd() + "/emailTemplates/idDeclined.ejs";
  ejs.renderFile(filename, (error, mailHTML) => { 
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "ID verification failed", // Subject line
      html: mailHTML,
      text: "You may log in and try again using the following link: "+"https://app.afrocamoney.com/logout/"
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
 
};

exports.emailUpdate = function (email, verificationKey) {
  const filename = process.cwd() + "/emailTemplates/emailUpdate.ejs";
  ejs.renderFile(filename,{resetLink: "https://app.afrocamoney.com/account/settings/email/"+verificationKey}, (error, mailHTML) => { 
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: email, // List of recipients //email
      subject: "Afrocamoney email update", // Subject line
      html: mailHTML,
      text: "Update your email with the following link: "+"https://app.afrocamoney.com/account/settings/email/"+verificationKey
    };
    transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.log(err);
        }
      });
  });
 
};

exports.contact = function (request, response) {
  if (!request.body.email || !request.body.name || !request.body.message)
  return response.json({ success: false, error: 2 });
  var email = request.body.email;
  var message = request.body.message;
  var name = request.body.name;
    const mailOptions = {
      from: process.env.emailUserName, // Sender address
      to: "matthias.beeler@nyv.ch", // List of recipients //email
      subject: "Support request", // Subject line
      replyTo: email,
      text: `New contact request from: ${name}; E-mail: ${email}; Message: \n${message}\n\nTimestamp: ${new Date(new Date().toLocaleString('en', {timeZone: 'Europe/Zurich'}))}`
    };
    transporter.sendMail(mailOptions, (err, res) => {
        if (err) {
          console.log(err);
          return response.json({success: false, error: 1, message: "An error occured"})
        }
        return response.json({success: true})
  });
 
};