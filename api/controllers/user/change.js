var Repositories = require('../../repositories'),
    validate = require("validate.js"),
    uuid = require('uuid');

var constraints = {
        password: {
            length: {
                minimum: 8,
                message: 'does not meet minimum length of 8'
            }
        },
        fullname: {
            length: {
                minimum: 3,
                message: 'does not meet minimum length of 3'
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

        if (validation) {
            var error = {error:{}};
            for (var key in validation) {
                error.error[key] = validation[key][0];
            }

            res.status(400).json(error);

        } else {

            // find user with that username and password (and APIKey)
            Repositories.Users.find({APIToken : head.APIToken}, function(result) {

                if (result.success){

                    if (result.users.length > 0){

                        var user = result.users[0];

                        if (req.body.fullname){
                            user.fullname = req.body.fullname;
                        }
                        if (req.body.password){
                            user.password = req.body.password;
                        }

                        Repositories.Users.update(user,function(result){

                            if (result.success){
                                res.end();
                            } else {
                                res.status(500).json({error : 'Internal server error!'});
                            }
                        });

                    } else {
                        res.status(400).json({error : 'Invalid token'});
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
