var Repositories = require('../../repositories'),
    validate = require("validate.js"),
    uuid = require('uuid');

var constraints = {
        username: {
            presence: {
                message: 'Missing username'
            }
        },
        password: {
            presence: {
                message: 'Missing password'
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

        if (validation) {
            var error = {error:{}};
            for (var key in validation) {
                error.error[key] = validation[key][0];
            }

            res.status(400).json(error);

        } else {

            // add the APIKey to the parameter
            req.body.APIKey = head.APIKey;

            // find user with that username and password (and APIKey)
            Repositories.Users.find(req.body, function(result) {

                if (result.success){

                    if (result.users.length > 0){

                        var user = result.users[0];

                        var token = uuid.v1();

                        user.APIToken.push(token);

                        Repositories.Users.save(user,function(result){

                            if (result.success){
                                res.json({
                                    token : token
                                });
                            } else {
                                res.status(500).json({error : 'Internal server error!'});
                            }
                        });

                    } else {
                        res.status(400).json({error : 'Invalid username or password'});
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
