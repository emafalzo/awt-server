var Repositories = require('../../repositories');

module.exports = function(req, res) {
    var final = {};
    Repositories.Users.find({},function(result){
        final['Users'] = result;
        Repositories.Campaigns.find({},function(result){
            final['Campaigns'] = result;
            Repositories.Tasks.find({},function(result){
                final['Tasks'] = result;
                Repositories.Images.find({},function(result){
                    final['Images'] = result;
                    res.end(JSON.stringify(final, null, 2));
                });
            });
        });
    });
};
