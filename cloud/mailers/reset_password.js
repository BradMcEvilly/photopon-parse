var _ = require("underscore");
var fs = require('fs');
var path = require('path');
var file = fs.readFileSync(path.join(process.env.PWD, "template", "password_reset_email.html"), "utf8");
var template = _.template(file);

Mailer.reset_password = function(user, password) {
  var mailOptions = {
    subject: 'Reset Password',
    // TODO: plain text template
    html: template({ name: user.get("username"), password: password }),
    to: user.get('email'),
    // bcc: "david@ezrdv.org"
  };
  Mailer.send(mailOptions);
}
