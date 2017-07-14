var Image = require('mongoose').model('Images');

exports.save = function(params, callback) {

    //create the new camapign document
    var new_image = new Image(params);

    // save the campaign document in the Database
    new_image.save(function(err, image) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                image   : image
            });

        }
    });

};

exports.find = function(params, callback) {

    Image.find(params, function(err, images) {

        //some constraint violated
        if (err){

            callback({
                success : false
            });

        } else {

            callback({
                success : true,
                images  : images
            });

        }

    });

};

exports.delete = function(params, callback) {

    Image.remove(params, function(err) {

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

    Image.updateOne({_id : id},params, function(err) {

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
