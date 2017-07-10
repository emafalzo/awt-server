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
  // read headers
  head = header(req);

  // if the header contains an APIToken
  if (head.APIToken){

      // find user with that APIToken
      User.findOne({APIToken: head.APIToken}, function(err, user) {

          if (user){

              Campaign.findById(req.params.id_campaign, function(err, campaign) {

                  if (campaign) {

                      Image.find({_id_campaign : req.params.id_campaign}, function(err, images) {

                          if (images) {

                              var rejected = 0,
                                  annotated = 0,
                                  accepted = 0;

                              images.forEach(function(image) {
                                  annotated += image.annotation.length;
                                  rejected += image.selection.rejected;
                                  accepted += image.selection.accepted;
                              });

                              res.json({
                                  images: images.length,
                                  annotated : annotated,
                                  rejected : rejected,
                                  accepted : accepted
                              });

                          } else {

                              res.status(404).json({});
                          }
                        //error in the query (I hope never happen)
                      });

                  } else {

                      res.status(404).json({});
                  }
              });
          } else {
              // raise 'Invalid Token' error
              res.status(401).json({error:'Invalid Token'});
          }

      });
  } else {

        // if the header does not contains an APIToken raise error
        res.status(400).json({error:'Authorization Required'});
  }


};

exports.start = function(req,res){

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        campaign.start(function(err,result){

                            if (err){
                                res.status(412).json({});
                            } else {
                                res.json({});
                            }
                        });

                    } else {

                        res.status(404).json({});
                    }
                });
            } else {
                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});
            }

        });
    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};

exports.terminate = function(req,res){

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        campaign.terminate(function(err,result){

                            if (err){
                                res.status(412).json({});
                            } else {
                                res.json({});
                            }
                        });

                    } else {

                        res.status(404).json({});
                    }
                });
            } else {
                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});
            }

        });
    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};

exports.list = function(req, res) {
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

          if (user) {

              Campaign.find({ _id_master : user._id}, function(err, campaigns) {

                  if (campaigns){

                      var response = {campaigns : []};

                      campaigns.forEach(function(campaign) {
                          response.campaigns.push({
                              id : '/api/campaign/' + campaign._id,
                              name : campaign.name,
                              status : campaign.status
                          });
                      });

                      res.json(response);
                  }

              });
          } else {
              // raise 'Invalid Token' error
              res.status(401).json({error:'Invalid Token'});
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
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){
                // add the id of the user who is creating the campaign to the parameters
                req.body._id_master = user._id;

                // create a new document campaign
                var new_campaign = new Campaign(req.body);

                // save the new campaign
                new_campaign.save(function(err, user) {

                    //error in the query (I hope never happen)
                    if (err){

                        // anyway if it happens
                        res.status(400).json(JSON.parse(err.message));

                    } else {

                        // campaign registration done (empty response)
                        res.json({});
                    }
                });

            } else {
                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});
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
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        campaign.changeDetails(req.body, function(err,result){

                            if (err){
                                res.status(400).json({error : JSON.parse(err.message)});
                            } else {
                                res.json({});
                            }
                        });

                    } else {

                        res.status(404).json({});
                    }
                });
            } else {
                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});
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
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                      res.json({
                          id : '/api/campaign/' + campaign._id,
                          name :  campaign.name,
                          status :  campaign.status,
                          selection_replica :  parseInt(campaign.selection_replica),
                          threshold :  parseInt(campaign.threshold),
                          annotation_replica :  parseInt(campaign.annotation_replica),
                          annotation_size :  parseInt(campaign.annotation_size),
                          image :  '/api/campaign/' + campaign._id + '/image',
                          worker :  '/api/campaign/' + campaign._id + '/worker',
                          execution :  '/api/campaign/' + campaign._id + '/execution',
                          statistics :  '/api/campaign/' + campaign._id + '/statistics'
                      });

                    } else {

                        res.status(404).json({});
                    }
                });
            } else {
                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});
            }

        });
    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }
};
