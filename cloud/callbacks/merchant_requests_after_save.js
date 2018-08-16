Parse.Cloud.afterSave("MerchantRequests", function(request) {
  
  if(!request.object.existed()){
    
      var promocode = request.object.get("promo")
    //if(promocode){  
      var Representative = Parse.Object.extend("Representative");
      var query = new Parse.Query(Representative);
      query.equalTo("repID",promocode);
      query.first({ useMasterKey:true }).then(function(representative){
        
          
          
          
            ParseClient.getSuperUsers().then(function(users){
              if(users){
                for( var i = 0; i<users.length; i++){
              
                var mailOptions = {
                  from: '"Photopon" <noreply@photopon.com>', 
                  subject: 'New Merchant Request Received', 
                  text: 'Dear '+users[i].get('username')+',\n\n You just received a new merchant access request from '+request.object.get("businessName")+""+((representative)? " (representative: "+representative.get("firstName")+")":""),
                  html: 'Dear '+users[i].get('username')+',<br><br>You just received a new merchant request from <b>'+request.object.get("businessName")+"</b>"+((representative) ? " (representative: "+representative.get("firstName")+")" : "")
                };
                  mailOptions.to = users[i].get('email');
                  request.log.info(users[i].get('email'));
                  Mailer.send(mailOptions);
                  Parse.Push.send({
                    channels: [ "User_"+users[i].id ],
                    data: {
                      type: "ADMIN",
                      notificationId: request.object.id,
                      badge: "Increment",
                      alert: mailOptions.text,
                      title: mailOptions.subject
                    }
                  }, {
                    useMasterKey: true,
                    success: function() {

                    },
                    error: function(error) {
                    // Handle error
                    }
                  });
                }
              }
            }).catch(function(error){
            });
            
            if(representative){
              request.object.set("isAccepted", true);
              request.object.save(null, {useMasterKey: true});
            }
        
      }).catch(function(error){
        request.log.info(Utils.pretty(error));
      });
        
        var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){
        
        var token =(Math.random()*Math.random()).toString(16).substr(2);
        
        u.set("emailValidationToken", token);
        
        u.save(null, {
            useMasterKey: true,
            success: function(user) {
            
            },
            error: function(user, error) {
            
            }
          });
        
        var mailOptions = {
                from: '"Photopon" <noreply@photopon.com>', 
                subject: 'Request Received', 
                text: 'Dear '+request.object.get('businessName')+',\n\nCongratulations your request has been sent. We will review your request within 24 hours and contact you. \n\nThank you.',
                html: 'Dear '+request.object.get('businessName')+', <br><br>Congratulations your request has been sent. We will review your request within 24 hours and contact you. <br><br>Thank you.'
              };
                mailOptions.to = u.get('email')
                Mailer.send(mailOptions);
        
      
      
            var mailOptions = {
                from: '"Photopon" <noreply@photopon.com>', 
                subject: 'Email Validation', 
                text: 'Dear '+request.object.get('businessName')+',\n\nPlease validate your email address by clicking to the following link: http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'. \n\nThank you.',
                html: 'Dear '+request.object.get('businessName')+',<br><br>Please validate your email address by clicking to the following link: <a href="http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'">http://photopon.co/merchants/admin/#/access/validateEmail/'+token+'</a>. <br><br>Thank you.'
              };
                mailOptions.to = u.get('email')
                Mailer.send(mailOptions);
        
      
        
        });
        
  
        
        
        
        
              
    
    //}
  
  }else{
  


  if (request.object.get("isAccepted")) {
  
      var CompanyClass = Parse.Object.extend("Company");
      var company = new CompanyClass();
      company.set("merchant",request.object.get("user"));
      company.set("taxID",request.object.get("taxID"));
      company.set("name", request.object.get("businessName"));
      company.set("image", request.object.get("logo"));
      company.save(null, {useMasterKey: true}).then(function(company){
          var promocode = request.object.get("promo")
          if(promocode){  
            var Representative = Parse.Object.extend("Representative");
            var query = new Parse.Query(Representative);
            query.equalTo("repID",promocode);
            query.first({ useMasterKey:true }).then(function(result){
              company.set("rep",result);
              company.save(null, {useMasterKey: true});
            })
      
          }
          request.object.get("user", {useMasterKey: true}).set("isMerchant", true);
          request.object.get("user", {useMasterKey: true}).save(null,{useMasterKey: true});
          request.object.destroy({useMasterKey: true});
          
              var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){
        
              var mailOptions = {
                from: '"Photopon" <noreply@photopon.com>', 
                subject: 'Request Accepted', 
                text: 'Dear '+company.get('name')+',\n\nCongratulations your request has been accepted. You can now login. \nhttp://photopon.co/merchants/admin/#/access/signin',
                html: 'Dear '+company.get('name')+', <br><br>Congratulations your request has been accepted. You can now login.<br><a href="http://photopon.co/merchants/admin/#/access/signin">http://photopon.co/merchants/admin/#/access/signin</a>'
              };
                mailOptions.to = u.get('email')
                Mailer.send(mailOptions);
        
      
        
        });
          
      }).catch(function(error){
        request.object.set("isAccepted",false);
        request.object.save(null,{useMasterKey: true});
      });
    
    
    }else{
          
          
            
      if(request.object.get("user")){
            
            
            var user = request.object.get("user").fetch({useMasterKey: true}).then(function(u){
                
                
                var mailOptions = {
                  from: '"Photopon" <noreply@photopon.com>', 
                  subject: 'Request Denied', 
                  text: 'Dear '+request.object.get('businessName')+',\n\Sorry your request has been denied.',
                  html: 'Dear '+request.object.get('businessName')+', <br><br>Sorry your request has been denied.'
                };
                  mailOptions.to = u.get('email')
                  Mailer.send(mailOptions);
                
                userr.destroy({useMasterKey: true}),then(function(){
                    request.object.destroy({useMasterKey: true});
                }).catch(function(error){
                  request.log.info(Utils.pretty(error));
                });
                
                
            
              
            }).catch(function(error){
              request.object.destroy({useMasterKey: true});
            
            });
          
            
          
            
            
      }else{
        request.object.destroy({useMasterKey: true});
      }   
    }
  
  }

});