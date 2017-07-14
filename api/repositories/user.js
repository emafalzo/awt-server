var User = require('mongoose').model('Users');

exports.save = function(params, callback) {

    //create the new user document
    var new_user = new User(params);

    // save the new user document in the Database
    new_user.save(function(err, user) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                user    : user
            });

        }
    });

};

exports.find =  function(params, callback) {

    // find user using params
    User.find(params, function(err, users) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                users    : users
            });

        }
    });

};

exports.delete = function(params, callback) {

    User.remove(params, function(err) {

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

    User.updateOne({_id : id},params, function(err) {

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
