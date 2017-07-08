var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Task = mongoose.model('Tasks'),
    Image = mongoose.model('Images'),
    multer  =   require('multer'),
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

function header(req){
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
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){


        // find user with that username and password (and APIKey)
        User.find({APIToken : head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error'});

            } else {

                // if no user has that username and password
                if (user.length != 1){

                    // set the error message and send response
                    res.status(401).json({error: 'Invalid Token'});

                } else {

                    var error = {error:{}};
                    var errored = false;

                    if (req.body.fullname && req.body.fullname.length <3){
                        errored = true;
                        error.error.fullname = 'does not meet minimum length of 3';
                    }
                    if (req.body.password && req.body.password.length <8){
                        errored = true;
                        error.error.password = 'does not meet minimum length of 8';
                    }

                    // if some parameter is missing
                    if (errored){

                        // raise error and tell what is missing
                        res.status(400).json(error);

                    }else {

                        // the user variable becomes the only user found
                        user = user[0];

                        // update fullname and/or password
                        if (req.body.fullname){
                            user.fullname = req.body.fullname;
                        }
                        if (req.body.password){
                            user.password = req.body.password;
                        }

                        // save the updated user
                        user.save(function (err, updatedUser) {

                            //error in the query (I hope never happen)
                            if (err){

                                // anyway if it happens
                                res.status(500).json({error:'Internal server error'});

                            } else {

                                // send the response with the new token
                                res.json({});
                            }

                        });

                    }
                }

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
        User.find({APIToken: head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error'});

            } else {

                // if no user has that username and password
                if (user.length != 1){

                    // raise 'Invalid Token' error
                    res.status(401).json({error:'Invalid Token'});

                } else {

                    // the user variable becomes the only user found
                    user = user[0];

                    // remove unnecessary attribute from user json object
                    var response = {};
                    response.fullname = user.fullname;
                    response.username = user.username;
                    response.type = user.type;

                    // send the response with the new token
                    res.json(response);

                }
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

        var error = {error:{}};
        var errored = false;

        if (!req.body.username){
            errored = true;
            error.error.username = 'is required';
        } else if (req.body.username.length < 3) {
            errored = true;
            error.error.username = 'does not meet minimum length of 3';
        }
        if (!req.body.fullname){
            errored = true;
            error.error.fullname = 'is required';
        } else if (req.body.fullname.length < 3) {
            errored = true;
            error.error.fullname = 'does not meet minimum length of 3';
        }
        if (!req.body.password){
            errored = true;
            error.error.password = 'is required';
        } else if (req.body.password.length < 8) {
            errored = true;
            error.error.password = 'does not meet minimum length of 8';
        }
        if (!req.body.type){
            errored = true;
            error.error.type = 'is required';
        } else if (req.body.type != 'master' &&  req.body.username != 'worker') {
            errored = true;
            error.error.type = 'is not one of enum values: master,worker';
        }

        // if there are some errors with parameters
        if (errored){

            // raise error and tell what is wrong
            res.status(400).json(error);

        } else {

            // add the APIKey to the parameter
            req.body.APIKey = head.APIKey;

            // create a new document user
            var new_user = new User(req.body);

            // save the new user
            new_user.save(function(err, user) {

                //error in the query (I hope never happen)
                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    // user registration done (empty response)
                    res.json({});
                }
            });
        }

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
            User.find(req.body, function(err, user) {

                //error in the query (I hope never happen)
                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    // if no user has that username and pass/userword
                    if (user.length != 1){

                        // set the error message and send response
                        error.error = 'Invalid username or password';
                        res.status(400).json(error);

                    } else {

                        // the user variable becomes the only user found
                        user = user[0];

                        // generate a new token
                        var token = uuid.v4();

                        // add the token to the user's tokens
                        user.APIToken.push(token);

                        // save the updated user
                        user.save(function (err, updatedUser) {

                            //error in the query (I hope never happen)
                            if (err){

                                // anyway if it happens
                                res.status(500).json({error:'Internal server error'});

                            } else {

                                // send the response with the new token
                                res.json({token:token});
                            }

                        });

                    }
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
        User.find({APIToken: head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error'});

            } else {

                // if no user has that token
                if (user.length != 1){

                    // raise 'Unknown Token' error
                    res.status(401).json({error:'Unknown Token'});

                } else {

                    // the user variable becomes the only user found
                    user = user[0];

                    // found the index of the token inside the array
                    var index = user.APIToken.indexOf(head.APIToken);

                    // remove the token from the array
                    user.APIToken.splice(index, 1);

                    // save the updated user
                    user.save(function (err, updatedUser) {

                        //error in the query (I hope never happen)
                        if (err) {

                            // anyway if it happens
                            res.status(500).json({error:'Internal server error'});

                        } else {

                            // logout sussesful (empty response)
                            res.json({});
                        }

                    });

                }

            }
        });

    } else {

        // if the header does not contains an APIToken raise error
        res.status(400).json({error:'Authorization Required'});
    }

};
