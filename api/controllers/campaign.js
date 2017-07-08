var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Task = mongoose.model('Tasks'),
    Image = mongoose.model('Images'),
    uuid = require('uuid');

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


exports.statistics = function(req,res){
  Image.find({_id_campaign : req.params.id_campaign}, function(err, images) {

      //error in the query (I hope never happen)
      if (err){

          // anyway if it happens
          res.status(500).json({error:'Internal server error1'});

      } else {
          var response={};
          response.images = images.length;

          var rejected = 0,
          annotated=0,
          accepted=0;
        images.forEach(function(image) {
            if (image.annotation.length>0){
              annotated +=1;
            }
            rejected += image.selection.rejected;
            accepted += image.selection.accepted;
        });
          response.annotated = annotated;
          response.rejected = rejected;
          response.accepted = accepted;
          res.json(response);
      }
});
};

exports.start = function(req,res){
    Campaign.findById(req.params.id_campaign, function(err, campaign) {

        //error in the query (I hope never happen)
        if (err){

            // anyway if it happens
            res.status(500).json({error:'Internal server error1'});

        } else {

            // if no user has that APIToken
            if (campaign === undefined){

                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});

            } else {


                  campaign.status = 'running';

                  // save the new campaign
                  campaign.save(function(err, user) {

                      //error in the query (I hope never happen)
                      if (err){

                          // anyway if it happens
                          res.status(500).json({error:'Internal server error2'});

                      } else {

                          // campaign registration done (empty response)
                          res.json({});
                      }
                  });
              }
          }

        });
};

exports.terminate = function(req,res){
    Campaign.findById(req.params.id_campaign, function(err, campaign) {

        //error in the query (I hope never happen)
        if (err){

            // anyway if it happens
            res.status(500).json({error:'Internal server error3'});

        } else {

            // if no user has that APIToken
            if (campaign === undefined){

                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});

            } else {


                  campaign.status = 'ended';

                  // save the new campaign
                  campaign.save(function(err, user) {

                      //error in the query (I hope never happen)
                      if (err){

                          // anyway if it happens
                          res.status(500).json({error:'Internal server error4'});

                      } else {

                          // campaign registration done (empty response)
                          res.json({});
                      }
                  });
              }
          }

        });
};

exports.list = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'aaInternal server error5'});

          } else {

              if (user.length != 1){

                  // raise 'Invalid Token' error
                  res.status(401).json({error:'Invalid Token'});

              } else {

                  user = user[0];

                  // find the campaign created by the user
                  Campaign.find({ _id_master : user._id}, function(err, campaigns) {
                      //error in the query (I hope never happen)
                      if (err){

                          // anyway if it happens
                          res.status(500).json({error:'Internal server error6'});

                      } else {

                          //build the response4

                          var response = {campaigns : []};


                          campaigns.forEach(function(campaign) {
                              var temp = {};
                              temp.id = '/api/campaign/' + campaign._id;
                              temp.name = campaign.name;
                              temp.status = campaign.status;
                              response.campaigns.push(temp);
                          });

                          res.json(response);
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




exports.create = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.find({APIToken: head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error7'});

            } else {

                // if no user has that APIToken
                if (user.length != 1){

                    // raise 'Invalid Token' error
                    res.status(401).json({error:'Invalid Token'});

                } else {

                    var error = {error:{}};
                    var errored = false;

                    if (!req.body.name){
                        errored = true;
                        error.error.name = 'is required';
                    } else if (req.body.name.length < 3) {
                        errored = true;
                        error.error.name = 'does not meet minimum length of 3';
                    }

                    if (!req.body.selection_replica){
                        errored = true;
                        error.error.selection_replica = 'is required';
                    } else if (typeof req.body.selection_replica  !== 'number') {
                        errored = true;
                        error.error.selection_replica = 'is not of a type(s) integer';
                    } else if (req.body.selection_replica  < 1) {
                        errored = true;
                        error.error.selection_replica = 'must have a minimum value of 1';
                    }

                    if (!req.body.threshold){
                        errored = true;
                        error.error.threshold = 'is required';
                    } else if (typeof req.body.threshold  !== 'number') {
                        errored = true;
                        error.error.threshold = 'is not of a type(s) integer';
                    } else if (req.body.threshold  < 1) {
                        errored = true;
                        error.error.threshold = 'must have a minimum value of 1';
                    }

                    if (!req.body.annotation_replica){
                        errored = true;
                        error.error.annotation_replica = 'is required';
                    } else if (typeof req.body.annotation_replica  !== 'number') {
                        errored = true;
                        error.error.annotation_replica = 'is not of a type(s) integer';
                    } else if (req.body.annotation_replica  < 1) {
                        errored = true;
                        error.error.annotation_replica = 'must have a minimum value of 1';
                    }

                    if (!req.body.annotation_size){
                        errored = true;
                        error.error.annotation_size = 'is required';
                    } else if (typeof req.body.annotation_size  !== 'number') {
                        errored = true;
                        error.error.annotation_size = 'is not of a type(s) integer';
                    } else if (req.body.annotation_size  < 1) {
                        errored = true;
                        error.error.annotation_size = 'must have a minimum value of 1';
                    }

                    // if there are some errors with parameters
                    if (errored){

                        // raise error and tell what is wrong
                        res.status(400).json(error);

                    } else {

                        user = user[0];

                        // add the status ready to the parameter
                        req.body.status = 'ready';

                        // add the id of the user who is creating the campaign to the parameters
                        req.body._id_master = user._id;

                        // create a new document campaign
                        var new_campaign = new Campaign(req.body);

                        // save the new campaign
                        new_campaign.save(function(err, user) {

                            //error in the query (I hope never happen)
                            if (err){

                                // anyway if it happens
                                res.status(500).json({error:'Internal server error8'});

                            } else {

                                // campaign registration done (empty response)
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


exports.change = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.find({APIToken: head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error9'});

            } else {

                // if no user has that APIToken
                if (user.length != 1){

                    // raise 'Invalid Token' error
                    res.status(401).json({error:'Invalid Token'});

                } else {

                    // find user with that APIToken
                    Campaign.findById(req.params.id_campaign, function(err, campaign) {

                        //error in the query (I hope never happen)
                        if (err){

                            // anyway if it happens
                            res.status(500).json({error:'Internal server error10'});

                        } else {

                            // if no user has that APIToken
                            if (campaign === undefined){

                                // raise 'Invalid Token' error
                                res.status(401).json({error:'Invalid Token'});

                            } else {

                                var error = {error:{}};
                                var errored = false;

                                if (!req.body.name){
                                    errored = true;
                                    error.error.name = 'is required';
                                } else if (req.body.name.length < 3) {
                                    errored = true;
                                    error.error.name = 'does not meet minimum length of 3';
                                }

                                if (!req.body.selection_replica){
                                    errored = true;
                                    error.error.selection_replica = 'is required';
                                } else if (typeof req.body.selection_replica  !== 'number') {
                                    errored = true;
                                    error.error.selection_replica = 'is not of a type(s) integer';
                                } else if (req.body.selection_replica  < 1) {
                                    errored = true;
                                    error.error.selection_replica = 'must have a minimum value of 1';
                                }

                                if (!req.body.threshold){
                                    errored = true;
                                    error.error.threshold = 'is required';
                                } else if (typeof req.body.threshold  !== 'number') {
                                    errored = true;
                                    error.error.threshold = 'is not of a type(s) integer';
                                } else if (req.body.threshold  < 1) {
                                    errored = true;
                                    error.error.threshold = 'must have a minimum value of 1';
                                }

                                if (!req.body.annotation_replica){
                                    errored = true;
                                    error.error.annotation_replica = 'is required';
                                } else if (typeof req.body.annotation_replica  !== 'number') {
                                    errored = true;
                                    error.error.annotation_replica = 'is not of a type(s) integer';
                                } else if (req.body.annotation_replica  < 1) {
                                    errored = true;
                                    error.error.annotation_replica = 'must have a minimum value of 1';
                                }

                                if (!req.body.annotation_size){
                                    errored = true;
                                    error.error.annotation_size = 'is required';
                                } else if (typeof req.body.annotation_size  !== 'number') {
                                    errored = true;
                                    error.error.annotation_size = 'is not of a type(s) integer';
                                } else if (req.body.annotation_size  < 1) {
                                    errored = true;
                                    error.error.annotation_size = 'must have a minimum value of 1';
                                }

                                // if there are some errors with parameters
                                if (errored){

                                    // raise error and tell what is wrong
                                    res.status(400).json(error);

                                } else {

                                    console.log(campaign);
                                    // update username and/or password
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

                                    // create a new document campaign
                                    //var edited_campaign = new Campaign(req.body);

                                    //console.log(edited_campaign);
                                    // save the new campaign
                                    campaign.save(function(err, user) {

                                        //error in the query (I hope never happen)
                                        if (err){

                                            // anyway if it happens
                                            res.status(500).json({error:'Internal server error11'});

                                        } else {

                                            // campaign registration done (empty response)
                                            res.json({});
                                        }
                                    });
                                }
                            }
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


exports.info = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.find({APIToken: head.APIToken}, function(err, user) {

            //error in the query (I hope never happen)
            if (err){

                // anyway if it happens
                res.status(500).json({error:'Internal server error12'});

            } else {

                console.log(req.params.id_campaign);
                // find user with that APIToken
                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    //error in the query (I hope never happen)
                    if (err){

                        // anyway if it happens
                        res.status(500).json({error:'Internal server error13'});

                    } else {

                        console.log(campaign);
                        // remove unnecessary attribute from user json object
                        var response = {};
                        response.id = '/api/campaign/' + campaign._id;
                        response.name = campaign.name;
                        response.status = campaign.status;
                        response.selection_replica = campaign.selection_replica;
                        response.threshold = campaign.threshold;
                        response.annotation_replica = campaign.annotation_replica;
                        response.annotation_size = campaign.annotation_size;
                        response.image = '/api/campaign/' + campaign._id + '/image';
                        response.worker = '/api/campaign/' + campaign._id + '/worker';
                        response.execution = '/api/campaign/' + campaign._id + '/execution';
                        response.statistics = '/api/campaign/' + campaign._id + '/statistics';

                        // send the response with the new token
                        res.json(response);
                    }

                });
            }
        });
    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};
