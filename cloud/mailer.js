//  __  __       _ _
// |  \/  | __ _(_) | ___ _ __
// | |\/| |/ _` | | |/ _ \ '__|
// | |  | | (_| | | |  __/ |
// |_|  |_|\__,_|_|_|\___|_|

const api_key = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
const logger = require('parse-server').logger;
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const _ = require("underscore");

var transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_SERVER,
        port: process.env.MAILGUN_SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user:  process.env.MAILGUN_SMTP_LOGIN, // generated ethereal user
            pass:  process.env.MAILGUN_SMTP_PASSWORD  // generated ethereal password
        }
    });

Mailer = {
  send: function(mailOptions) {
    mailOptions.from = '"Photopon" <noreply@photopon.com>';
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error("[MAIL ERROR] "+Utils.pretty(error));
      } else {
        logger.info("[mail ok] sent "+Utils.pretty(info));
      }
    });
  },
  readTemplate: function(filename) {
    // TODO: memoize template for reuse
    var file = fs.readFileSync(path.join(process.env.PWD, "template", filename), "utf8");
    return _.template(file);
  }
}

var dir = path.join(__dirname,'mailers');
fs.readdirSync(dir).forEach(function(file){
  require(path.join(dir, file));
})

exports = Mailer;