var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Image = mongoose.model('Images'),
    Task = mongoose.model('Tasks'),
    multer  =   require('multer'),
    async = require("async");

/*

MANCA CHE QUANDO IL TASK È FATTO DEVO CARICARE L'IMMAGE SUCCESSIVA!!!!!!!!!!!!!!!!!!
*/
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
exports.list = function(req,res){

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                  Task.find({_id_worker : user._id}, function(err, tasks) {

                      if (tasks){

                          var response = {tasks: []};

                          tasks.forEach(function(task){

                              if (task._id_campaign.status == 'started'){
                                    response.tasks.push({
                                        id : '/api/task/'+task._id,
                                        type : task.type,
                                    });
                              }

                          });

                          res.json(response);

                      } else {
                          res.status(412).json({});
                      }
                  }).populate('_id_campaign');


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


exports.info = function(req,res){

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Task.findById(req.params.id_task, function(err,task){

                    if (task){
                        res.json({
                          id : '/api/task/'+task._id,
                          type : task.type,
                          session : '/api/task/'+task._id + '/session',
                          statistics : '/api/task/'+task._id + '/statistics'
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

                  Task.findById(req.params.id_task, function(err,task){

                      if (task){

                          if ((task.type == 'selection')){ //&& (task.current === null)){
                              Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                  task.current = null;

                                  if (images){

                                      var found = false;

                                      images.forEach(function(image){
                                          if (!found && !task._id_images.includes(image._id) && image.selection_replica < parseInt(task._id_campaign.selection_replica)){
                                            found = true;
                                            task.current = image._id;
                                          }
                                      });

                                  }

                                  task.save(function (err,up) {
                                      if(err){
                                          res.json(JSON.parse(err.message));
                                      } else {
                                          if(task.current === null){
                                              res.status(404).json({});
                                          } else {
                                              res.json({});
                                          }

                                      }

                                  });

                              });

                          } else if ((task.type == 'annotation')){ // && (task.current === null)) {

                              Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                  task.current = null;

                                  if (images){

                                      var found = false;

                                      images.forEach(function(image){
                                          if (!found && !task._id_images.includes(image._id) && image.annotation_replica < parseInt(task._id_campaign.annotation_replica)  && image.threshold >= parseInt(task._id_campaign.threshold)){
                                            found = true;
                                            task.current = image._id;
                                          }
                                      });

                                  }

                                  task.save(function (err,up) {
                                      if(err){
                                          res.json(JSON.parse(err.message));
                                      } else {
                                          if(task.current === null){
                                              res.status(404).json({});
                                          } else {
                                              res.json({});
                                          }

                                      }

                                  });

                              });

                          } else {
                              res.json({});
                          }

                      } else {
                          res.status(404).json({});
                      }

                  }).populate('_id_campaign');


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

exports.next = function(req,res){

        // read headers
        head = header(req);

        // if the header contains an APIToken
        if (head.APIToken){

            // find user with that APIToken
            User.findOne({APIToken: head.APIToken}, function(err, user) {

                if (user){

                    Task.findById(req.params.id_task, function(err,task){

                        if (task && task.current !== null){

                            Image.findById(task.current, function(err,image){

                                if (image){

                                    var temp={
                                        image : '/image/' + image.canonical,
                                        type : task.type
                                    };

                                    if (task.type == 'annotation'){
                                        temp.size = parseInt(task._id_campaign.annotation_size);
                                    }

                                    res.json(temp);
                                } else {
                                    res.status(404).json({});
                                }

                            });

                        } else {
                            res.status(404).json({});
                        }

                    }).populate('_id_campaign');


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


exports.result = function(req,res){

        // read headers
        head = header(req);

        // if the header contains an APIToken
        if (head.APIToken){

            // find user with that APIToken
            User.findOne({APIToken: head.APIToken}, function(err, user) {

                if (user){

                    Task.findById(req.params.id_task, function(err,task){

                        if (task){

                            Image.findById(task.current, function(err,image){

                                if (image){

                                    task._id_images.push(task.current);

                                    if (task.type == 'selection'){
                                        if (req.body.accepted === true){
                                            image.selection.accepted += 1;
                                            task.accepted += 1;
                                        }else {
                                            image.selection.rejected += 1;
                                            task.rejected += 1;
                                        }

                                    }else if (task.type == 'annotation') {
                                        image.annotation.push(req.body.skyline);
                                        task.annotated += 1;
                                    }



                                    image.save(function (err,up) {

                                        if(err){
                                            // anyway if it happens
                                            res.status(500).json({error:'Internal server error'});
                                        } else {
                                          if ((task.type == 'selection')){

                                              Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                                  task.current = null;

                                                  if (images){

                                                      var found = false;

                                                      images.forEach(function(image){
                                                          if (!found && !task._id_images.includes(image._id) && image.selection_replica < parseInt(task._id_campaign.selection_replica)){
                                                            found = true;
                                                            task.current = image._id;
                                                          }
                                                      });

                                                  }

                                                  task.save(function (err,up) {
                                                      if(err){
                                                          res.json(JSON.parse(err.message));
                                                      } else {
                                                          if(task.current === null){
                                                              res.status(404).json({});
                                                          } else {
                                                              res.json({});
                                                          }

                                                      }

                                                  });

                                              });

                                          } else if ((task.type == 'annotation')) {

                                              Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                                  task.current = null;

                                                  if (images){

                                                      var found = false;

                                                      images.forEach(function(image){
                                                          if (!found && !task._id_images.includes(image._id) && image.annotation_replica < parseInt(task._id_campaign.annotation_replica)  && image.threshold >= parseInt(task._id_campaign.threshold)){
                                                            found = true;
                                                            task.current = image._id;
                                                          }
                                                      });

                                                  }

                                                  task.save(function (err,up) {
                                                      if(err){
                                                          res.json(JSON.parse(err.message));
                                                      } else {
                                                          if(task.current === null){
                                                              res.status(404).json({});
                                                          } else {
                                                              res.json({});
                                                          }

                                                      }

                                                  });

                                              });

                                          } else {
                                              res.json({});
                                          }
                                        }

                                    });
                                } else {

                                }

                            });

                        } else {
                            res.status(404).json({});
                        }

                    }).populate('_id_campaign');


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

exports.statistics = function(req,res){

        // read headers
        head = header(req);

        // if the header contains an APIToken
        if (head.APIToken){

            // find user with that APIToken
            User.findOne({APIToken: head.APIToken}, function(err, user) {

                if (user){

                    Task.findById(req.params.id_task, function(err,task){

                        if (task){

                            if (task.type == 'selection'){

                                Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                    if (images){

                                        var count = 0;

                                        images.forEach(function(image){
                                            if (!task._id_images.includes(image._id) && image.selection_replica < parseInt(task._id_campaign.selection_replica)){
                                                count +=1;
                                            }
                                        });

                                        res.json({
                                            available: count,
                                            accepted: task.accepted,
                                            rejected: task.rejected
                                        });

                                    } else {
                                        res.status(404).json({});
                                    }

                                });

                            } else if (task.type == 'annotation') {

                                Image.find({_id_campaign:task._id_campaign}, function(err,images){

                                    if (images){

                                        var count = 0;

                                        images.forEach(function(image){
                                            if (!task._id_images.includes(image._id) && image.annotation_replica < parseInt(task._id_campaign.annotation_replica)  && image.threshold >= parseInt(task._id_campaign.threshold)){
                                                count +=1;
                                            }
                                        });

                                        res.json({
                                            available: count,
                                            annotated: task.annotated
                                        });

                                    } else {
                                        res.status(404).json({});
                                    }

                                });

                            } else {
                                  res.status(404).json({});
                            }
                        } else {
                              res.status(404).json({});
                        }
                    }).populate('_id_campaign');


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
