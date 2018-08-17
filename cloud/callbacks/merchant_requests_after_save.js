var _ = require("underscore");

Parse.Cloud.afterSave("MerchantRequests", function(request) {
  if (!request.object.existed()) {
    var promocode = request.object.get("promo")
    var Representative = Parse.Object.extend("Representative");
    var query = new Parse.Query(Representative);
    query.equalTo("repID", promocode);
    query.first({ useMasterKey: true })
      .then(function(representative) {
        ParseClient.eachSuperUser(function(superuser) {
          var mailOptions = {
            subject: 'New Merchant Request Received',
            to: superuser.get("email"),
            text: 'Dear Photopon Admin,\n\nYou just received a new merchant access request from '+request.object.get("businessName")+""+((representative)? " (representative: "+representative.get("firstName")+")":""),
            html: 'Dear Photopon Admin,<br><br>You just received a new merchant request from <b>'+request.object.get("businessName")+"</b>"+((representative) ? " (representative: "+representative.get("firstName")+")" : "")
          };
          Mailer.send(mailOptions);

          Parse.Push.send({
            channels: "User_"+superuser.id,
            data: {
              type: "ADMIN",
              notificationId: request.object.id,
              badge: "Increment",
              alert: mailOptions.text,
              title: mailOptions.subject
            }
          }, {
            useMasterKey: true,
            success: function() {},
            error: function(error) {}
          });
        });

        if (representative) {
          request.object.set("isAccepted", true);
          request.object.save(null, { useMasterKey: true });
        }
      })
      .catch(function(error) {
        request.log.info(Utils.pretty(error));
      });

    var user = request.object.get("user")
      .fetch({ useMasterKey: true })
      .then(function(u) {
        var token = (Math.random() * Math.random()).toString(16).substr(2);
        u.set("emailValidationToken", token);
        u.save(null, { useMasterKey: true }).then(function(){        
          // Why do we send two separate emails?
          Mailer.request_received(request.object.get('businessName'));
          Mailer.validate_email(u, request.object.get('businessName'), token)
        });
      });

  } else {
    if (request.object.get("isAccepted")) {
      var CompanyClass = Parse.Object.extend("Company");
      var company = new CompanyClass();
      company.set("merchant", request.object.get("user"));
      company.set("taxID", request.object.get("taxID"));
      company.set("name", request.object.get("businessName"));
      company.set("image", request.object.get("logo"));
      company.save(null, { useMasterKey: true })
        .then(function(company) {
          var promocode = request.object.get("promo")
          if (promocode) {
            var Representative = Parse.Object.extend("Representative");
            var query = new Parse.Query(Representative);
            query.equalTo("repID", promocode);
            query.first({ useMasterKey: true })
              .then(function(result) {
                company.set("rep", result);
                company.save(null, { useMasterKey: true });
              })
          }
          request.object.get("user", { useMasterKey: true }).set("isMerchant", true);
          request.object.get("user", { useMasterKey: true }).save(null, { useMasterKey: true });
          request.object.destroy({ useMasterKey: true });

          var user = request.object.get("user")
            .fetch({ useMasterKey: true })
            .then(function(u) {
              Mailer.request_accepted(u, company.get('name'))
            });
        })
        .catch(function(error) {
          request.object.set("isAccepted", false);
          request.object.save(null, { useMasterKey: true });
        });
    } else {
      // this can probably be cleaned all up to one promise
      if (request.object.get("user")) {
          var user = request.object.get("user").fetch({ useMasterKey: true }).then(function(u) {
              Mailer.request_denied(u, request.object.get('businessName'));
              user.destroy({ useMasterKey: true }).then(function() {
                  request.object.destroy({ useMasterKey: true });
              }, function(error) {
                  request.log.info(Utils.pretty(error));
              });
          }, function(error) {
              request.object.destroy({ useMasterKey: true });
          });
      } else {
        request.object.destroy({ useMasterKey: true });
      }
    }
  }
});