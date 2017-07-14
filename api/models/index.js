var mongoose = require('mongoose'),
    Campaign = require('./campaign'),
    Image = require('./image'),
    Task = require('./task'),
    User = require('./user');

module.exports = mongoose.model('Campaigns', Campaign.Schema);
module.exports = mongoose.model('Images', Image.Schema);
module.exports = mongoose.model('Tasks', Task.Schema);
module.exports = mongoose.model('Users', User.Schema);
