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

          Repositories.Users.find({APIToken : head.APIToken, type: 'worker'}, function(result) {

              if (result.success){

                  if (result.users.length > 0){

                      var user = result.users[0];

                      Repositories.Tasks.find({_id : req.params.id_task, _id_worker : user._id}, function(result) {

                          if (result.success){

                              if (result.tasks.length > 0){

                                  var task = result.tasks[0];

                                  res.json({
                                      id : '/api/task/'+task._id,
                                      type : task.type,
                                      session : '/api/task/'+task._id + '/session',
                                      statistics : '/api/task/'+task._id + '/statistics'
                                  });
                              } else {

                                  res.status(404).json({error : 'Task not found!'});
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
