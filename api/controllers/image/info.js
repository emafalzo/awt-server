var Repositories = require('../../repositories');

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


module.exports = function(req, res) {

    // read headers
    head = header(req);

    // if the header contains an APIKey
    if (head.APIToken){

          Repositories.Users.find({APIToken : head.APIToken, type : 'master'}, function(result) {

              if (result.success){

                  if (result.users.length > 0){

                      var user = result.users[0];

                      Repositories.Campaigns.find({_id : req.params.id_campaign, _id_master : user._id}, function(result) {

                          if (result.success){

                              if (result.campaigns.length > 0){

                                  var campaign = result.campaigns[0];

                                  Repositories.Images.find({_id : req.params.id_image, _id_campaign : req.params.id_campaign }, function(result) {

                                      if (result.success){

                                          if (result.images.length > 0){

                                              var image = result.images[0];

                                              res.json({
                                                  id : '/api/campaign/' + image._id_campaign + '/image/' + image._id ,
                                                  canonical : '/image/' + image.canonical,
                                                  statistics : '/api/campaign/' + image._id_campaign + '/image/' + image._id +'/statistics'
                                              });

                                          } else {
                                                res.status(404).json({error : 'Image not found!!'});
                                          }


                                      } else {
                                          res.status(500).json({error : 'Internal server error!'});
                                      }

                                  });


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

};
