Mailer.request_received = function(user, name) {
  var mailOptions = {
    subject: "Request Received",
    text: Mailer.readTemplate("request_received.text")({ name: name }),
    html: Mailer.readTemplate("request_received.html")({ name: name }),
    to: u.get("email")
  };
  Mailer.send(mailOptions);
}
