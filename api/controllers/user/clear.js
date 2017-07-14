var Repositories = require('../../repositories');

module.exports = function(req,res){
    Repositories.Users.delete({},function(result){
        Repositories.Campaigns.delete({},function(result){
            Repositories.Images.delete({},function(result){
                Repositories.Tasks.delete({},function(result){
                    res.json({success: true});
                });
            });
        });
    });
};
