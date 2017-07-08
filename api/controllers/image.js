var mongoose = require('mongoose'),
    User = mongoose.model('Users'),
    Campaign = mongoose.model('Campaigns'),
    Image = mongoose.model('Images'),
    multer  =   require('multer'),
    fs = require('fs'),
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

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, uuid.v4());
  }
});

var upload = multer({ storage : storage}).any();

exports.info = function(req,res){
    Image.findById(req.params.id_image, function (err, image) {
        if (err) {
              res.status(500).json({error:'Internal server error'});
        } else {

              var temp = {};
              temp.id = '/api/campaign/' + image._id_campaign + '/image/' + image._id ;
              temp.canonical = '/image/' + image.canonical;
              temp.statistics = '/api/campaign/' + image._id_campaign + '/image/' + image._id +'/statistics';
              res.json(temp);

        }
    });
};

exports.statistics = function(req,res){
    Image.findById(req.params.id_image, function (err, image) {
        if (err) {
              res.status(500).json({error:'Internal server error'});
        } else {

              var temp = {};
              temp.selection =  image.selection;
              temp.annotation = image.annotation;
              res.json(temp);

        }
    });
};

exports.delete = function(req,res){
    Image.findById(req.params.id_image, function (err, image) {
        if (err) {
              res.status(500).json({error:'Internal server error'});
        } else {
            Image.remove({ _id: req.params.id_image }, function(err) {
              if (err) {
                    res.status(500).json({error:'Internal server error'});
              } else {
                    var fs = require('fs');
                    var filePath = './uploads/' + image.canonical;
                    fs.unlinkSync(filePath);

                    res.end('ok');
              }
          });
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
              res.status(500).json({error:' server error'});

          } else {


              if (user.length != 1){

                  // raise 'Invalid Token' error
                  res.status(401).json({error:'Invalid Token'});

              } else {

                  user = user[0];

                  // find the campaign created by the user
                  Campaign.find({_id_master : user._id, _id: req.params.id_campaign}, function(err, campaigns) {
                      //error in the query (I hope never happen)
                      if (err){

                          // anyway if it happens
                          res.status(500).json({error:'Internal server error'});

                      } else {

                          if (campaigns.length != 1){

                              // raise 'Invalid Token' error
                              res.status(401).json({error:'Invalid Token'});

                          } else {




                            Image.find({_id_campaign : req.params.id_campaign}, function(err, images) {
                                //error in the query (I hope never happen)
                                if (err){

                                    // anyway if it happens
                                    res.status(500).json({error:'Internal server error'});

                                } else {

                                    var response = {images : []};


                                    images.forEach(function(image) {
                                        var temp = {};
                                        temp.id = '/api/campaign/' + image._id_campaign + '/image/' + image._id ;
                                        temp.canonical = '/image/' + image.canonical;
                                        response.images.push(temp);
                                    });

                                    res.json(response);

                                }

                              });


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


exports.upload = function(req,res){

    upload(req,res,function(err) {

        if(err) {
            return res.json({error: 'Error uploading file'});
        } else {

            Campaign.find({_id: req.params.id_campaign}, function(err, campaigns) {
                //error in the query (I hope never happen)
                if (err){

                    // anyway if it happens
                    res.status(500).json({error:'Internal server error'});

                } else {

                    if (campaigns.length != 1){

                        // raise 'Invalid Token' error
                        res.status(401).json({error:'Invalid Token'});

                    } else {


                        req.files.forEach(function(file) {
                            var image = {};

                            image.canonical = file.filename;
                            image._id_campaign = req.params.id_campaign;

                            // create a new document campaign
                            var new_image = new Image(image);

                            // save the new campaign
                            new_image.save();
                        });

                        res.json({bella:'raga'});

                    }
                }
            });


        }

    });
};


exports.serve = function(req,res){

    Image.find({canonical : req.params.id_image}, function(err, image) {

        if (err){

            // anyway if it happens
            res.status(500).json({error:'Internal server error'});

        } else {

            if (image.length != 1){

                // raise 'Invalid Token' error
                res.status(401).json({error:'Invalid Token'});

            } else {

                var img = fs.readFileSync('./uploads/' + req.params.id_image);
                res.writeHead(200, {'Content-Type': 'image/jpg' });
                res.end(img, 'binary');
            }
        }
    });
};
