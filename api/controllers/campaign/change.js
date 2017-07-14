var Repositories = require('../../repositories'),
    validate = require("validate.js");

var constraints = {
        name: {
            length: {
                minimum: 3,
                message: 'does not meet minimum length of 3'
            }
        },
        selection_replica: {
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        threshold: {
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        annotation_replica: {
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        annotation_size: {
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
                lessThanOrEqualTo : 10,
                notLessThanOrEqualTo : 'must have a maximum value of 10'
            }
        }
    };


function header(req, res){
    var auth = req.headers['authorization'];
    if (auth){
        var values = auth.split(' ');
        if (values[0] == 'APIKey'){
            return {'APIKey' : values[1]};
        } else if (values[0] == 'APIToken') {
            return  {'APIToken' : values[1]};
        }
    }
    return {};
}


module.exports = function(req, res) {

    // read headers
    head = header(req);

    // if the header contains an APIKey
    if (head.APIToken){

          var validation = validate(req.body , constraints, {fullMessages: false} );

          if (validation){
              var error = {error:{}};
              for (var key in validation) {
                  error.error[key] = validation[key][0];
              }

              res.status(400).json(error);

          } else {

              Repositories.Users.find({APIToken : head.APIToken, type: 'master'}, function(result) {

                  if (result.success){

                      if (result.users.length > 0){

                          var user = result.users[0];

                          Repositories.Campaigns.find({_id : req.params.id_campaign, status :'ready', _id_master: user._id}, function(result) {

                              if (result.success){

                                  if (result.campaigns.length > 0){

                                      var campaign = result.campaigns[0];

                                      if (req.body.name){
                                          campaign.name = req.body.name;
                                      }
                                      if (req.body.selection_replica){
                                          campaign.selection_replica = req.body.selection_replica;
                                      }
                                      if (req.body.threshold){
                                          campaign.threshold = req.body.threshold;
                                      }
                                      if (req.body.annotation_replica){
                                          campaign.annotation_replica = req.body.annotation_replica;
                                      }
                                      if (req.body.annotation_size){
                                          campaign.annotation_size = req.body.annotation_size;
                                      }

                                      Repositories.Campaigns.update(campaign, function(result) {

                                          if (result.success){
                                              res.end();
                                          } else {
                                              res.status(500).json({error : 'Internal server error!'});
                                          }

                                      });

                                  } else {
                                      res.status(412).json({error : 'Cannot change details!'});
                                  }
                              } else {
                                  res.status(500).json({error : 'Internal server error!'});
                              }

                          });

                      } else {
                          res.status(400).json({error : 'Invalid token!'});
                      }

                  } else {
                      res.status(500).json({error : 'Internal server error!'});
                  }

              });

          }

    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }

};
