var Repositories = require('../../repositories'),
    validate = require("validate.js");

var constraints = {
        username: {
            presence: {
                message: 'is required'
            },
            length: {
                minimum: 3,
                message: 'does not meet minimum length of 3'
            }
        },
        password: {
            presence: {
                message: 'is required'
            },
            length: {
                minimum: 8,
                message: 'does not meet minimum length of 8'
            }
        },
        fullname: {
            presence: {
                message: 'is required'
            },
            length: {
                minimum: 3,
                message: 'does not meet minimum length of 3'
            }
        },
        type: {
            presence: {
                message: 'is required'
            },
            inclusion: {
                within: ['master','worker'],
                message: 'is not one of enum values: master, worker'
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
    if (head.APIKey){

          var validation = validate(req.body , constraints, {fullMessages: false} );

          if (validation){
              var error = {error:{}};
              for (var key in validation) {
                  error.error[key] = validation[key][0];
              }

              res.status(400).json(error);

          } else {

              // add the APIKey to the parameter
              req.body.APIKey = head.APIKey;

              // find user with that username and password (and APIKey)
              Repositories.Users.save(req.body, function(result) {

                  if (result.success){

                      res.end();

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
