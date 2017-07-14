var Campaign = require('mongoose').model('Campaigns');

exports.save = function(params, callback) {

    //create the new camapign document
    var new_campaign = new Campaign(params);

    // save the campaign document in the Database
    new_campaign.save(function(err, campaign) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success  : true,
                campaign : campaign
            });

        }
    });

};

exports.find = function(params, callback) {

    Campaign.find(params, function(err, campaigns) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success   : true,
                campaigns : campaigns
            });

        }

    });

};

exports.delete = function(params, callback) {

    Campaign.remove(params, function(err) {

      //some constraint violated
      if (err){

          callback({
              success : false
          });

      } else {

          callback({
              success : true
          });

      }
    });
};


exports.update = function(params, callback) {

    var id = params._id;
    delete params._id;

    Campaign.updateOne({_id : id},params, function(err) {

      //some constraint violated
      if (err){

          callback({
              success : false
          });

      } else {

          callback({
              success : true
          });

      }
    });
};
