var Repositories = require('../../repositories'),
    validate = require("validate.js");

var constraints = {
        name: {
            presence: {
                message: 'is required'
            },
            length: {
                minimum: 3,
                message: 'does not meet minimum length of 3'
            }
        },
        selection_replica: {
            presence: {
                message: 'is required'
            },
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        threshold: {
            presence: {
                message: 'is required'
            },
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        annotation_replica: {
            presence: {
                message: 'is required'
            },
            numericality: {
                notValid : 'is not of a type(s) integer',
                onlyInteger: true,
                notInteger : 'is not of a type(s) integer',
                greaterThanOrEqualTo: 1,
                notGreaterThanOrEqualTo : 'must have a minimum value of 1',
            }
        },
        annotation_size: {
            presence: {
                message: 'is required'
            },
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

              Repositories.Users.find({APIToken : head.APIToken, type : 'master'}, function(result) {

                  if (result.success){

                      if (result.users.length > 0){

                          var user = result.users[0];

                          // add the id of the user who is creating the campaign to the parameters
                          req.body._id_master = user._id;

                          Repositories.Campaigns.save(req.body, function(result) {

                              if (result.success){
                                  res.end();
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
