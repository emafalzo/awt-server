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

    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        Image.findById(req.params.id_image, function (err, image) {

                            if (image) {
                                  res.json({
                                      id : '/api/campaign/' + image._id_campaign + '/image/' + image._id ,
                                      canonical : '/image/' + image.canonical,
                                      statistics : '/api/campaign/' + image._id_campaign + '/image/' + image._id +'/statistics'
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
console.log('si');
                        Image.findById(req.params.id_image, function (err, image) {
                            console.log(req.params.id_image);
                            if (image) {
                              console.log(image.annotation);
                                  res.json({
                                    selection :  image.selection,
                                    annotation : image.annotation
                                  });
                            } else {
                                  res.status(404).json({});
                            }

                        });

                    } else {
console.log('no');
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

exports.delete = function(req,res){
    // read headers
    head = header(req);

    // if the header contains an APIToken
    if (head.APIToken){

        // find user with that APIToken
        User.findOne({APIToken: head.APIToken}, function(err, user) {

            if (user){

                Campaign.findById(req.params.id_campaign, function(err, campaign) {

                    if (campaign) {

                        Image.findById(req.params.id_image, function (err, image) {

                            if (image) {

                                Image.remove({ _id: req.params.id_image }, function(err) {
                                    if (err) {
                                        res.status(500).json({error:'Internal server error'});
                                    } else {

                                        var fs = require('fs');
                                        var filePath = './uploads/' + image.canonical;
                                        fs.unlinkSync(filePath);

                                        res.json({});
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

                        Image.find({_id_campaign : req.params.id_campaign}, function(err, images) {
                            //error in the query (I hope never happen)

                            if (images) {
                                var response = {images : []};

                                images.forEach(function(image) {
                                    response.images.push({
                                        id : '/api/campaign/' + image._id_campaign + '/image/' + image._id ,
                                        canonical : '/image/' + image.canonical
                                    });
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
              // raise 'Invalid Token' error
              res.status(401).json({error:'Invalid Token'});
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
        }

      // read headers
      head = header(req);

      // if the header contains an APIToken
      if (head.APIToken){

          // find user with that APIToken
          User.findOne({APIToken: head.APIToken}, function(err, user) {

              if (user){

                  Campaign.findById(req.params.id_campaign, function(err, campaign) {

                      if (campaign) {

                          req.files.forEach(function(file) {

                              // create a new document campaign
                              var new_image = new Image({
                                  canonical : file.filename,
                                  _id_campaign : req.params.id_campaign
                              });

                              // save the new campaign
                              new_image.save();
                          });

                          res.json({bella:'raga'});

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
    });
};

exports.serve = function(req,res){

    Image.findOne({canonical: req.params.id_image}, function (err, image) {

        if (image) {

            var img = fs.readFileSync('./uploads/' + req.params.id_image);
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(img, 'binary');

        } else {
            res.status(404).json({});
        }

    });


};
