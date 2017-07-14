var Repositories = require('../../repositories');

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

        // find user with that username and password (and APIKey)
        Repositories.Users.find({APIToken : head.APIToken}, function(result) {

            if (result.success){

                if (result.users.length > 0){

                    var user = result.users[0];

                    var index = user.APIToken.indexOf(head.APIToken);

                    // remove the token from the array
                    user.APIToken.splice(index, 1);

                    Repositories.Users.update(user, function(result) {

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

    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};
