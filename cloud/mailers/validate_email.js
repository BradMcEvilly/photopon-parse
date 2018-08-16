Mailer.validate_email = function(user, name, token) {
  url = process.env.BASE_URL+"merchants/admin/#/access/validateEmail/"+token
  var mailOptions = {
    subject: "Email Validation",
    text: Mailer.readTemplate("validate_email.text")({ name: name, url: url }),
    html: Mailer.readTemplate("validate_email.html")({ name: name, url: url }),
    to: u.get("email")
  };
  Mailer.send(mailOptions);
}
