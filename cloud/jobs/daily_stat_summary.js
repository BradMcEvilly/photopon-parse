Parse.Cloud.job("DailyStatSummary", function(request, status) {
    
    try{
    Parse.Cloud.useMasterKey();
  
    status.message("I just started");
  
    request.log.info(("test"));
  
    var promises = [];
  
    var d = new Date();
    var start = new moment(d);
    start.add(-1,'day');
    start.startOf('day');
    
    var finish = new moment(start);
    finish.add(1, 'day');

    
    var newMerchants = new Parse.Query("MerchantRequests");
    newMerchants.greaterThanOrEqualTo("createdAt", start.toDate());
    newMerchants.lessThan("createdAt", finish.toDate());
    //ewMerchants.doesNotExist('parentItem');
  
    var newMerchantsByRep = new Parse.Query("MerchantRequests");
    newMerchantsByRep.greaterThanOrEqualTo("createdAt", start.toDate());
    newMerchantsByRep.lessThan("createdAt", finish.toDate());
    newMerchantsByRep.exists('promo');
    newMerchantsByRep.select("promo");
    //newMerchantsByRep.distinct("promo");
    
    var newCoupons = new Parse.Query("Coupon");
    newCoupons.greaterThanOrEqualTo("createdAt", start.toDate());
    newCoupons.lessThan("createdAt", finish.toDate());
    
    var newPhotopons = new Parse.Query("Photopon");
    newPhotopons.greaterThanOrEqualTo("createdAt", start.toDate());
    newPhotopons.lessThan("createdAt", finish.toDate());
    
    
    promises.push(newMerchants.count({useMasterKey: true}));
    promises.push(newMerchantsByRep.distinct("promo",{useMasterKey: true}));
    promises.push(newCoupons.count({useMasterKey: true}));
    promises.push(newPhotopons.count({useMasterKey: true}));
    
    
    Parse.Promise.when(promises).then(function(result1) {
      var returnData = {};
      returnData["newMerchants"] = result1[0]; 
        returnData["newMerchantsByRep"] = result1[1].length; 
        returnData["newCoupons"] = result1[2]; 
        returnData["newPhotopons"] = result1[3]; 
        
        var file = fs.readFileSync("/app/template/dailyStats.html", "utf8");
        var template = _.template(file);
     
        
          ParseClient.getSuperUsers().then(function(users){
            if(users){
              for( var i = 0; i<users.length; i++){
                var mailOptions = {
                  from: '"Photopon" <noreply@photopon.com>', 
                  subject: 'Daily Stats '+start.format('ll'), 
                  html: template({name:users[i].get("username"),date:start.format('ll'), stats:returnData})
                };
                mailOptions.to = users[i].get('email');
                mailOptions.bcc = "david@ezrdv.org";
                transporter.sendMail(mailOptions, (error, info) => {});
                
              }
            }
          },function(error){
          });
      
        
        
      request.log.info(pretty(returnData));
      status.success(pretty(returnData));

    }, function(error) {
      status.error((error));
    });
  
  }catch(e){
    status.error((e));
  
  }

});