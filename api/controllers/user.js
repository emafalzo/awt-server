var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Task = mongoose.model('Tasks'),
    Image = mongoose.model('Images'),
    multer  = require('multer'),
    uuid = require('uuid');

exports.listUsers = function(req, res) {
  User.find({}, function(err, user) {
    if (err)
      res.send(err);
    res.json(user);
  });
};

exports.clear = function(req,res){
  User.remove({}, function(err, user) {
      console.log('User rimossi');
      Image.remove({}, function(err, user) {
          console.log('Image rimossi');
          Campaign.remove({}, function(err, user) {
              console.log('Campaign rimossi');
              Task.remove({}, function(err, user) {
                  console.log('Task rimossi');

                  /* Drop the DB */
                  mongoose.connection.db.dropDatabase();
                  res.end('cavallo');

              });
          });
      });
  });

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

exports.change = function(req, res){
    // read headers
    head = header(req, res);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that username and password (and APIToken)
        User.findOne({APIToken : head.APIToken}, function(err, user) {

            if (user) {

                user.changeInfo(req.body,function(err){

                    if (err) {
                        res.status(400).json(JSON.parse(err.message));
                    } else {
                        res.json({});
                    }
                });
            } else {
                // set the error message and send response
                res.status(401).json({error: 'Invalid Token'});
            }

        });
    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};

exports.info = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that username and password (and APIKey)
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user) {

                // send the response with the new token
                res.json({
                    fullname : user.fullname,
                    username : user.username,
                    type : user.type
                });

            } else {
                // set the error message and send response
                res.status(401).json({error: 'Invalid Token'});
            }

        });

    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};

exports.register = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIKey
    if (head.APIKey){

            // add the APIKey to the parameter
            req.body.APIKey = head.APIKey;

            // create a new document user
            var new_user = new User(req.body);

            // save the new user
            new_user.save(function(err, user) {

                //some constraint violated
                if (err){

                    // anyway if it happens
                    res.status(404).json((JSON.parse(err.message)));

                } else {

                    // user registration done (empty response)
                    res.json({});
                }
            });

    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};

exports.login =  function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIKey
    if (head.APIKey){

        var error = {error:{}};
        var errored = false;
        if (!req.body.username){
            errored = true;
            error.error.username = 'Missing username';
        }
        if (!req.body.password){
            errored = true;
            error.error.password = 'Missing password';
        }

        // if some parameter is missing
        if (errored){

            // raise error and tell what is missing
            res.status(400).json(error);

        } else {

            // add the APIKey to the parameter
            req.body.APIKey = head.APIKey;

            // find user with that username and password (and APIKey)
            User.findOne(req.body, function(err, user) {


                if (user){

                    user.addToken(function(err,token) {
                        if (err) {
                            // anyway if it happens
                            res.status(404).json((JSON.parse(err.message)));
                        } else {

                            res.json(token);
                        }

                    });
                } else {
                    res.status(400).json({error : 'Invalid username or password'});
                }

            });
        }
  } else {

        // if the header does not contains an APIToken raise error
        res.status(400).json({error:'Authorization Required'});
  }
};

exports.logout = function(req, res){
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find the user who has that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                user.deleteToken(head.APIToken, function(err,token) {
                    if (err) {
                        // anyway if it happens
                        res.status(404).json((JSON.parse(err.message)));
                    } else {

                        res.json(token);
                    }

                });
            } else {
                res.status(400).json({error : 'Invalid token'});
            }

        });

    } else {

        // if the header does not contains an APIToken raise error
        res.status(400).json({error:'Authorization Required'});
    }

};
