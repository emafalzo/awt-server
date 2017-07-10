var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Image = mongoose.model('Images'),
    Task = mongoose.model('Tasks'),
    multer  =   require('multer'),
    async = require("async");

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

                          User.findById(req.params.id_worker, function(err, worker) {

                              if (worker){

                                  Task.find({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign}, function(err, tasks) {

                                      if(tasks){

                                          var response = {
                                              id : '/api/campaign/' + req.params.id_campaign + '/worker/' + req.params.id_worker ,
                                              fullname : worker.fullname,
                                              selector : false,
                                              annotator : false,
                                              selection : '/api/campaign/' + req.params.id_campaign + '/worker/' + req.params.id_worker + '/selection',
                                              annotation : '/api/campaign/' + req.params.id_campaign + '/worker/' + req.params.id_worker + '/annotation'
                                          };

                                          tasks.forEach(function(task){

                                              if (task.type == 'selection'){
                                                  response.selector = true;
                                              } else if (task.type == 'annotation') {
                                                  response.annotator = true;
                                              }
                                          });

                                          res.json(response);

                                      } else {
                                          res.status(404).json({});
                                      }

                                  });
                              } else {
                                  res.status(404).json({});
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

                if (user){

                    Campaign.findById(req.params.id_campaign, function(err, campaign) {

                        if (campaign) {

                            User.find({type: 'worker'}, function(err, users) {

                                if (users){

                                    Task.find({_id_campaign : req.params.id_campaign}, function(err, tasks) {

                                        if (tasks){

                                            var response = {workers: []};
                                            var temp_users = {};

                                            users.forEach(function(u){

                                                temp_users[u._id] = {
                                                    id : '/api/campaign/' + req.params.id_campaign + '/worker/' + u._id ,
                                                    fullname : u.fullname,
                                                    selector : false,
                                                    annotator : false
                                                };
                                                console.log(temp_users[u._id]);
                                            });

                                            tasks.forEach(function(task){

                                                if (task.type == 'selection'){
                                                    temp_users[task._id_worker].selector = true;
                                                }else if (task.type == 'annotation') {
                                                    temp_users[task._id_worker].annotator = true;
                                                }

                                            });

                                            for (var u1 in temp_users) {
                                                response.workers.push(temp_users[u1]);
                                            }

                                            res.json(response);

                                        } else {
                                            res.status(404).json({});
                                        }

                                    });

                                } else {
                                    res.status(404).json({});
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

exports.enableSelection = function(req, res) {

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        User.findById(req.params.id_worker, function(err, worker) {

                            if (worker){

                                Task.findOne({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign, type: 'selection'}, function(err, task) {

                                    if (task){
                                        res.status(412).json({});
                                    } else {
                                        // create a new document task
                                        var new_task = new Task({
                                            _id_campaign : req.params.id_campaign,
                                            _id_worker : req.params.id_worker,
                                            type : 'selection'
                                        });

                                        // save the new task
                                        new_task.save(function(err, task) {

                                            //error in the query (I hope never happen)
                                            if (err){

                                                // anyway if it happens
                                                res.status(400).json(JSON.parse(err.message));

                                            } else {

                                                // user registration done (empty response)
                                                res.json({});
                                            }
                                        });
                                    }
                                });

                            } else {
                                res.status(404).json({});
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

exports.enableAnnotation = function(req, res) {

      // read headers
      head = header(req);

      // if the header contains an APIToken
      if (head.APIToken){

          // find user with that APIToken
          User.findOne({APIToken: head.APIToken}, function(err, user) {

              if (user){

                  Campaign.findById(req.params.id_campaign, function(err, campaign) {

                      if (campaign) {

                          User.findById(req.params.id_worker, function(err, worker) {

                              if (worker){

                                  Task.findOne({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign, type: 'annotation'}, function(err, task) {

                                      if (task){
                                          res.status(412).json({});
                                      } else {
                                          // create a new document task
                                          var new_task = new Task({
                                              _id_campaign : req.params.id_campaign,
                                              _id_worker : req.params.id_worker,
                                              type : 'annotation'
                                          });

                                          // save the new task
                                          new_task.save(function(err, task) {

                                              //error in the query (I hope never happen)
                                              if (err){

                                                  // anyway if it happens
                                                  res.status(400).json(JSON.parse(err.message));

                                              } else {

                                                  // user registration done (empty response)
                                                  res.json({});
                                              }
                                          });
                                      }
                                  });

                              } else {
                                  res.status(404).json({});
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

exports.disableSelection = function(req, res) {
  // read headers
  head = header(req);

  // if the header contains an APIToken
  if (head.APIToken){

      // find user with that APIToken
      User.findOne({APIToken: head.APIToken}, function(err, user) {

          if (user){

              Campaign.findById(req.params.id_campaign, function(err, campaign) {

                  if (campaign) {

                      User.findById(req.params.id_worker, function(err, worker) {

                          if (worker){

                              Task.findOne({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign, type: 'selection'}, function(err, task) {

                                  if (task){

                                      // qui in realta potrei eliminare solo quel documento, ma per sicurezza rimuovo con un aquery
                                      Task.remove({ _id_campaign: req.params.id_campaign, _id_worker: req.params.id_worker, type: 'selection' }, function(err) {
                                            if (err) {
                                                  res.status(500).json({error:'Internal server error'});
                                            } else {
                                                  res.end('ok');
                                            }
                                      });

                                  } else {
                                      res.status(412).json({});
                                  }
                              });

                          } else {
                              res.status(404).json({});
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

exports.disableAnnotation = function(req, res) {
  // read headers
  head = header(req);

  // if the header contains an APIToken
  if (head.APIToken){

      // find user with that APIToken
      User.findOne({APIToken: head.APIToken}, function(err, user) {

          if (user){

              Campaign.findById(req.params.id_campaign, function(err, campaign) {

                  if (campaign) {

                      User.findById(req.params.id_worker, function(err, worker) {

                          if (worker){

                              Task.findOne({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign, type: 'annotation'}, function(err, task) {

                                  if (task){

                                      // qui in realta potrei eliminare solo quel documento, ma per sicurezza rimuovo con un aquery
                                      Task.remove({ _id_campaign: req.params.id_campaign, _id_worker: req.params.id_worker, type: 'annotation' }, function(err) {
                                            if (err) {
                                                  res.status(500).json({error:'Internal server error'});
                                            } else {
                                                  res.end('ok');
                                            }
                                      });

                                  } else {
                                      res.status(412).json({});
                                  }
                              });

                          } else {
                              res.status(404).json({});
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
