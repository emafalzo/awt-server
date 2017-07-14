var Task = require('mongoose').model('Tasks');

exports.save = function(params, callback) {

    //create the new camapign document
    var new_task = new Task(params);

    // save the campaign document in the Database
    new_task.save(function(err, task) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                task    : task
            });

        }
    });

};

exports.find = function(params, callback) {

    Task.find(params, function(err, tasks) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                tasks   : tasks
            });

        }

    }).populate('_id_campaign');;

};

exports.delete = function(params, callback) {

    Task.remove(params, function(err) {

      //some constraint violated
      if (err){

          callback({
              success : false
          });

      } else {

          callback({
              success : true
          });

      }
    });
};

exports.update = function(params, callback) {

    var id = params._id;
    delete params._id;

    Task.updateOne({_id : id},params, function(err) {

      //some constraint violated
      if (err){

          callback({
              success : false
          });

      } else {

          callback({
              success : true
          });

      }
    });
};
