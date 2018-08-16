Mailer.reset_password = function(user, password) {
  var mailOptions = {
    subject: "Reset Password",
    text: Mailer.readTemplate("password_reset_email.text")({ name: user.get("username"), password: password }),
    html: Mailer.readTemplate("password_reset_email.html")({ name: user.get("username"), password: password }),
    to: user.get("email")
  };
  Mailer.send(mailOptions);
}
