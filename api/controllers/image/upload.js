var Repositories = require('../../repositories'),
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



module.exports = function(req,res){

    upload(req,res,function(err) {


        if(err) {
            return res.json({error: 'Error uploading file'});
        }

        // read headers
        head = header(req);

        // if the header contains an APIToken
        if (head.APIToken){

            Repositories.Users.find({APIToken : head.APIToken, type : 'master'}, function(result) {

                if (result.success){

                    if (result.users.length > 0){

                        var user = result.users[0];

                        Repositories.Campaigns.find({_id : req.params.id_campaign, _id_master : user._id, status : 'ready'}, function(result) {

                            if (result.success){

                                if (result.campaigns.length > 0){

                                    if (req.files.length > 0){
                                        var new_image = {
                                            canonical : req.files[0].filename,
                                            _id_campaign : req.params.id_campaign
                                        };

                                        Repositories.Images.save(new_image, function(result) {

                                            if (result.success){
                                                res.end();
                                            } else {
                                                res.status(500).json({error : 'Internal server error!'});
                                            }

                                        });

                                    } else {
                                        res.status(400).json({error : 'No file selected!'});
                                    }

                                } else {
                                    res.status(404).json({error : 'Campaign not found!'});
                                }

                            } else {
                                res.status(500).json({error : 'Internal server error!'});
                            }

                        });

                    } else {
                        res.status(400).json({error : 'Invalid token!'});
                    }

                } else {
                    res.status(500).json({error : 'Internal server error!'});
                }

            });

        } else {

              // if the header does not contains an APIToken raise error
              res.status(400).json({error:'Authorization Required'});
        }
    });
};
