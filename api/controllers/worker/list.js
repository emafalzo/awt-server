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

          Repositories.Users.find({APIToken : head.APIToken}, function(result) {

              if (result.success){

                  if (result.users.length > 0){

                      var user = result.users[0];

                      Repositories.Campaigns.find({_id : req.params.id_campaign}, function(result) {

                          if (result.success){

                              if (result.campaigns.length > 0){

                                  Repositories.Users.find({type : 'worker', APIKey : user.APIKey}, function(result) {

                                      if (result.success){

                                        var users = result.users;

                                          Repositories.Tasks.find({_id_campaign : req.params.id_campaign}, function(result) {

                                              if (result.success){

                                                  var tasks = result.tasks;

                                                  var response = {workers: []};
                                                  var temp_users = {};

                                                  users.forEach(function(u){

                                                      temp_users[u._id] = {
                                                          id : '/api/campaign/' + req.params.id_campaign + '/worker/' + u._id ,
                                                          fullname : u.fullname,
                                                          selector : false,
                                                          annotator : false
                                                      };
                                                  });

                                                  tasks.forEach(function(task){

                                                      if (task.type == 'selection'){
                                                          temp_users[task._id_worker].selector = true;
                                                      }else if (task.type == 'annotation') {
                                                          temp_users[task._id_worker].annotator = true;
                                                      }

                                                  });

                                                  for (var u1 in temp_users) {
                                                      response.workers.push(temp_users[u1]);
                                                  }

                                                  res.json(response);

                                              } else {
                                                  res.status(500).json({error : 'Internal server error!'});
                                              }

                                          });
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
