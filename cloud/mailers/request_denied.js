Mailer.request_denied = function(user, name) {
  var mailOptions = {
    subject: "Request Denied",
    text: Mailer.readTemplate("request_denied.text")({ name: name }),
    html: Mailer.readTemplate("request_denied.html")({ name: name }),
    to: user.get("email")
  };
  Mailer.send(mailOptions);
}
