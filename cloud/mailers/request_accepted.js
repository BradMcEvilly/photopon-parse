Mailer.request_accepted = function(user, name) {
  url = process.env.BASE_URL+"merchants/admin/#/access/signin/"
  var mailOptions = {
    subject: "Request Accepted",
    text: Mailer.readTemplate("request_accepted.text")({ name: name, url: url }),
    html: Mailer.readTemplate("request_accepted.html")({ name: name, url: url }),
    to: user.get("email")
  };
  Mailer.send(mailOptions);
}
