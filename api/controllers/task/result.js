var Repositories = require('../../repositories'),
    includes = require('array-includes');

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

          Repositories.Users.find({APIToken : head.APIToken, type: 'worker'}, function(result) {

              if (result.success){

                  if (result.users.length > 0){

                      var user = result.users[0];

                      Repositories.Tasks.find({_id : req.params.id_task , _id_worker : user._id}, function(result) {

                          if (result.success){

                              if (result.tasks.length > 0){

                                  var task = result.tasks[0];

                                  if (task.current != null){

                                      Repositories.Images.find({_id:task.current, _id_campaign : task._id_campaign}, function(result) {

                                          if (result.success){

                                              if (result.images.length >0){

                                                  var image = result.images[0];

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

                                                  Repositories.Images.update(image, function(result) {

                                                      if (result.success){


                                                          Repositories.Images.find({_id_campaign:task._id_campaign._id}, function(result) {

                                                              if (result.success){

                                                                  var images = result.images;

                                                                  var found = false;

                                                                  task.current = null;

                                                                  if (task.type == 'selection'){

                                                                      images.forEach(function(image){
                                                                          if (!found && !includes(task._id_images,image._id) && image.selection_replica < parseInt(task._id_campaign.selection_replica)){
                                                                            found = true;
                                                                            task.current = image._id;
                                                                          }
                                                                      });

                                                                  } else if (task.type == 'annotation'){ // && (task.current === null))) {

                                                                      images.forEach(function(image){
                                                                          if (!found && !includes(task._id_images,image._id) && image.annotation_replica < parseInt(task._id_campaign.annotation_replica)  && image.threshold >= parseInt(task._id_campaign.threshold)){
                                                                            found = true;
                                                                            task.current = image._id;
                                                                          }
                                                                      });

                                                                  }

                                                                  task._id_campaign = task._id_campaign._id;

                                                                  Repositories.Tasks.update(task, function(result) {

                                                                      if (result.success){
                                                                          if (task.current == null){
                                                                              res.status(404).json({error : 'No more images!'});
                                                                          } else {
                                                                              res.end();
                                                                          }
                                                                      } else {
                                                                          res.status(500).json({error : 'Internal server error!'});
                                                                      }
                                                                  });

                                                              } else {
                                                                  res.status(500).json({error : 'Internal server error!'});
                                                              }

                                                          });

                                                      } else {
                                                          res.status(500).json({error : 'Internal server error!'});
                                                      }

                                                  });

                                              } else {
                                                  res.status(404).json({error : 'Current image not found!'});
                                              }

                                          } else {
                                              res.status(500).json({error : 'Internal server error!'});
                                          }

                                      });

                                  } else {

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

};
