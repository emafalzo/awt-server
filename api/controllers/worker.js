var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Image = mongoose.model('Images'),
    Task = mongoose.model('Tasks'),
    multer  =   require('multer'),
    async = require("async");


exports.info = function(req, res) {
  User.find({ _id : req.params.id_worker}, function(err, users) {
    if (err){
      res.send(err);
    } else {

      user = users[0];

      Task.find({_id_worker : req.params.id_worker, _id_campaign : req.params.id_campaign}, function(err, tasks) {
        if (err){
          res.send(err);
        } else {


          var response = {};

          response.id = '/api/campaign/' + req.params.id_campaign + '/worker/' + user._id ;
          response.fullname = user.fullname;
          response.selector = false;
          response.annotator = false;
          response.selection = '/api/campaign/' + req.params.id_campaign + '/worker/' + user._id + '/selection';
          response.annotation = '/api/campaign/' + req.params.id_campaign + '/worker/' + user._id + '/annotation';

          tasks.forEach(function(task){
            console.log(task);
            if (task.type == 'selection'){
              response.selector = true;
            }else if (task.type == 'annotation') {
              response.annotator = true;
            }
          });

          res.json(response);
        }
      });
    }

  });
};


exports.list = function(req, res) {
  User.find({}, function(err, users) {
    if (err){
      res.send(err);
    } else {

      Task.find({}, function(err, tasks) {
        if (err){
          res.send(err);
        } else {

          var response = {workers: []};
          temp_users = {};

          users.forEach(function(user){
            var temp = {};
            temp.id = '/api/campaign/' + req.params.id_campaign + '/worker/' + user._id ;
            temp.fullname = user.fullname;
            temp.selector = false;
            temp.annotator = false;

            temp_users[user._id] = temp;
          });

          tasks.forEach(function(task){
            console.log(task);
            if (task.type == 'selection'){
              temp_users[task._id_worker].selector = true;
            }else if (task.type == 'annotation') {
              temp_users[task._id_worker].annotator = true;
            }
          });

          for (var user in temp_users) {
            response.workers.push(temp_users[user]);
          }

          res.json(response);
        }
      });
    }

  });
};

exports.enableSelection = function(req, res) {

    console.log('enablle selection');

    var temp = {};
    temp._id_campaign = req.params.id_campaign;
    temp._id_worker = req.params.id_worker;
    temp.type = 'selection';

    // create a new document task
    var new_task = new Task(temp);

    // save the new task
    new_task.save(function(err, task) {

        //error in the query (I hope never happen)
        if (err){

            // anyway if it happens
            res.status(500).json({error:'Internal server error'});

        } else {

            // user registration done (empty response)
            res.json({});
        }
    });
};

exports.enableAnnotation = function(req, res) {
    var temp = {};
    temp._id_campaign = req.params.id_campaign;
    temp._id_worker = req.params.id_worker;
    temp.type = 'annotation';

    // create a new document task
    var new_task = new Task(temp);

    // save the new task
    new_task.save(function(err, task) {

        //error in the query (I hope never happen)
        if (err){

            // anyway if it happens
            res.status(500).json({error:'Internal server error'});

        } else {

            // user registration done (empty response)
            res.json({});
        }
    });
};

exports.disableSelection = function(req, res) {
    Task.remove({ _id_campaign: req.params.id_campaign, _id_worker: req.params.id_worker, type: 'selection' }, function(err) {
            if (err) {
                  res.status(500).json({error:'Internal server error'});
            } else {
                  res.end('ok');
            }
        });
};

exports.disableAnnotation = function(req, res) {
  Task.remove({ _id_campaign: req.params.id_campaign, _id_worker: req.params.id_worker , type: 'annotation' }, function(err) {
          if (err) {
                res.status(500).json({error:'Internal server error'});
          } else {
                res.end('ok');
          }
      });
};
