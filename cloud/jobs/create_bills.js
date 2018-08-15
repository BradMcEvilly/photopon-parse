Parse.Cloud.job("CreateBills", function(request, response) {
    var WhenBillsGenerated = function(merchantCouponMap) {
      var numMerchants = Object.keys(merchantCouponMap).length;
      response.success("Generated " + numMerchants + " invoices");
    };


    var GetLastBill = function(id, callback) {

      var user = new Parse.User();
      user.id = id;


      var billQuery = new Parse.Query("Bills");
      billQuery.equalTo("user", user);
      billQuery.descending("generation");
      
      billQuery.first({
        success: function(object) {
          callback(object);
        },
        error: function(error) {
          callback(null);
        }
      });


    };


    var GenerateBillForMerchant = function(merchantId, coupons, properties, callback) {
      var BillClass = Parse.Object.extend("Bills");

      var centPerShare = properties.centPerShare ? properties.centPerShare : 5;
      var centPerRedeem = properties.centPerRedeem ? properties.centPerRedeem : 25;

      GetLastBill(merchantId, function(lastBill) {

        var totalShares = 0;
        var totalRedeems = 0;

        var minCouponTime = new Date();
        for (var i = 0; i < coupons.length; i++) {

          if (coupons[i].createdAt < minCouponTime) {
            minCouponTime = coupons[i].createdAt;
          }

          totalShares += parseInt(coupons[i].get("numShared") || 0, 10);
          totalRedeems += parseInt(coupons[i].get("numRedeemed") || 0, 10);
        };


        var lastTotalShared = parseInt(lastBill ? (lastBill.get("numShared") || 0) : 0, 10);
        var lastTotalRedeemed = parseInt(lastBill ? (lastBill.get("numRedeemed") || 0) : 0, 10);

        var generation = parseInt(lastBill ? lastBill.get("generation") : 0, 10);

        var currentShared = totalShares - lastTotalShared;
        var currentRedeemed = totalRedeems - lastTotalRedeemed;


        var user = new Parse.User();
        user.id = merchantId;
        
        var bill = new BillClass();

        bill.set("numShared", totalShares);
        bill.set("numRedeemed", totalRedeems);

        bill.set("currentShares", currentShared);
        bill.set("currentRedeems", currentRedeemed);

        bill.set("centPerShare", centPerShare);
        bill.set("centPerRedeem", centPerRedeem);

        bill.set("previousBillDate", lastBill ? lastBill.createdAt : minCouponTime);

        bill.set("generation", generation + 1);


        bill.set("user", user);



        bill.save(null, {
          success: function(bill) {
            callback();
          },
          error: function(bill, error) {
            throw ("Failed to save object.");
          }
        });
      });


    };

    var WhenCouponsFetched = function(merchantCouponMap, companyProperties) {

      var numMerchantsLeft = Object.keys(merchantCouponMap).length;


      for (var merchantId in merchantCouponMap) {
        GenerateBillForMerchant(merchantId, merchantCouponMap[merchantId], companyProperties[merchantId], function() {
          numMerchantsLeft--;
          if (numMerchantsLeft == 0) {
            WhenBillsGenerated(merchantCouponMap);
          }
        });
      }

    };


    var GetMerchantCoupons = function() {
      var Company = Parse.Object.extend("Company");

      var queryCompany = new Parse.Query(Company);
      queryCompany.include("merchant");

      queryCompany.find({

        success: function(companies) {
          var merchants = {};
          var companyProperties = {};

          for (var i = 0; i < companies.length; i++) {
            
            var company = companies[i];
            var merchantObject = company.get("merchant");

            var numRequests = companies.length;
          
            if (!merchantObject) {
              console.log("Error: Merchant not found for company " + company.get("name") + " [" + company.id + "]");
              
              numRequests = numRequests - 1;

              if (numRequests == 0) {
                WhenCouponsFetched(merchants, companyProperties);
              }
              continue;
            }

            merchants[merchantObject.id] = [];
            companyProperties[merchantObject.id] = {
              centPerShare: company.get("centPerShare"),
              centPerRedeem: company.get("centPerRedeem")
            };


            (function(id) {
              
              console.log("Getting " + id);
              
              var user = new Parse.User();
              user.id = id;


              var couponQuery = new Parse.Query("Coupon");
              couponQuery.equalTo("owner", user);
              couponQuery.find({
                success: function(merchantCoupons) {
                  numRequests = numRequests - 1;

                  for (var j = 0; j < merchantCoupons.length; j++) {
                    merchants[id].push(merchantCoupons[j]);
                  };

                  if (numRequests == 0) {
                    WhenCouponsFetched(merchants, companyProperties);
                  }

                },
                error: function(error, res) {
                  throw error;
                }
              })

            })(merchantObject.id);




          }
        
        },
        error: function(error) {
          throw ("Error: " + error.code + " " + error.message);
        }
      });
    };



    try {
      GetMerchantCoupons();
    } catch (ex) {
      response.error(ex);
    }

    


});
