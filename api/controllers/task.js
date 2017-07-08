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


  // if the header contains an APIKey
  if (head.APIToken){
      User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'Internal server error'});

          } else {

              var response = {tasks: []};
              Task.find({_id_worker : user[0]._id}, function(err,tasks){
                  tasks.forEach(function(task){
                    var temp = {};
                    temp.id = '/api/task/'+task._id;
                    temp.type = task.type;
                    response.tasks.push(temp);
                  });
                  res.json(response);
              });

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


  // if the header contains an APIKey
  if (head.APIToken){
      User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'Internal server error'});

          } else {

              var response = {tasks: []};
              Task.findById(req.params.id_task, function(err,task){

                    var temp = {};
                    temp.id = '/api/task/'+task._id;
                    temp.type = task.type;
                    temp.session = temp.id + '/session';
                    temp.statistics = temp.id + '/statistics';
                  res.json(temp);
              });

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


  // if the header contains an APIKey
  if (head.APIToken){
      User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'Internal server error'});

          } else {
              console.log('ladro');
              Task.findById(req.params.id_task, function(err,task){

                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    Image.find({_id_campaign:task._id_campaign}, function(err,images){

                      if (err){

                          // anyway if it happens
                          res.status(500).json({error:'Internal server error'});

                      } else {
                          var found = false;
                          images.forEach(function(image){
                              if (!found && !task._id_images.includes(image._id)){
                                found = true;
                                task.current = image._id;
                                task.done = false;

                                task.save(function (err,up) {
                                    //if (err) return handleError(err);
                                    res.json(up);
                                });

                              }


                          });
                      }
                });
              }
              });

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


  // if the header contains an APIKey
  if (head.APIToken){
      User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'Internal server error'});

          } else {
              console.log('ladro');
              Task.findById(req.params.id_task, function(err,task){

                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    Image.findById(task.current, function(err,image){

                        if (err){

                            // anyway if it happens
                            res.status(500).json({error:'Internal server error'});

                        } else {

                            var temp={};
                            temp.id = '/image/' + image.canonical;
                            temp.type = task.type;

                            if (task.type == 'selection'){
                                res.json(temp);

                            }else{
                                Campaign.findById(task._id_campaign, function(err,campaign){

                                    if (err){

                                        // anyway if it happens
                                        res.status(500).json({error:'Internal server error'});

                                    } else {

                                        temp.size = campaign.annotation_size;
                                        res.json(temp);
                                    }
                                });
                            }
                        }
                    });
                }

            });
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


  // if the header contains an APIKey
  if (head.APIToken){
      User.find({APIToken: head.APIToken}, function(err, user) {

          //error in the query (I hope never happen)
          if (err){

              // anyway if it happens
              res.status(500).json({error:'Internal server error'});

          } else {
              console.log('ladro');
              Task.findById(req.params.id_task, function(err,task){

                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    Image.findById(task.current, function(err,image){

                        if (err){

                            // anyway if it happens
                            res.status(500).json({error:'Internal server error'});

                        } else {


                            var temp={};
                            temp.id = '/image/' + image.canonical;
                            temp.type = task.type;

                            if (task.type == 'selection'){
                                if (req.body.accepted === true){
                                    image.selection.accepted += 1;
                                }else {
                                    image.selection.rejected += 1;
                                }

                            }else if (task.type == 'selection') {
                                image.annotation.push(req.body.annotation);
                            }

                            task.done = true;

                            image.save(function (err,up) {
                                //if (err) return handleError(err);
                                task.save(function (err,up) {
                                    //if (err) return handleError(err);
                                    res.json(up);
                                });
                            });
                        }
                    });
                }

            });
        }

      });

    } else {

          // if the header does not contains an APIToken raise error
          res.status(400).json({error:'Authorization Required'});
    }


};
