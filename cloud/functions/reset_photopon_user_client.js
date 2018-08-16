Parse.Cloud.define("resetPhotoponUserClient", function(request, response) {

    //Parse.Cloud.useMasterKey();

   var file = fs.readFileSync("/app/template/password_reset_email.html", "utf8");
   var template = _.template(file);
     
  

    var email = request.params.email;
    
    request.log.info(email);

    var query = new Parse.Query(Parse.User);
    query.equalTo("email", email);
    query.limit(1);

    query.first({useMasterKey: true}).then(function(user) {
     var password  = Math.random().toString(36).slice(-8);
    
     user.set("password",password);
     user.set("isTempPassword",true);
     user.save(null, {
          useMasterKey: true,
          success: function(user) {
            
          },
          error: function(user, error) {
            
          }
        });
    
    
       request.log.info(password);
  
     
     var mailOptions = {
        from: '"Photopon" <noreply@photopon.com>', 
        subject: 'Reset Password', 
        html: template({name:user.get("username"),password: password })
    };
    mailOptions.to = user.get('email');
    mailOptions.bcc = "david@ezrdv.org";
     transporter.sendMail(mailOptions, (error, info) => {});
     
     response.success("");  
        
  }).catch(function(error){
    request.log.info(Utils.pretty(error));
        response.error("User does't exist.");
  
  });    
        

});
