var uuid = require('uuid'),
    Schema = require('mongoose').Schema;

var CampaignSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_master: {
        type: String,
        ref: 'User'
    },
    name: {
        type : String
    },
    status: {
        type: String,
        default: 'ready'
    },
    selection_replica: {
        type: String
    },
    threshold: {
        type: String
    },
    annotation_replica: {
        type: String
    },
    annotation_size: {
        type: String
    },

},{ versionKey: false });

exports.Schema = CampaignSchema;
