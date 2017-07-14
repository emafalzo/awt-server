var uuid = require('uuid'),
    Schema = require('mongoose').Schema;

var TaskSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_campaign: {
        type: String,
        ref: 'Campaigns'
    },
    _id_worker: {
        type: String,
        ref: 'Users'
    },
    _id_images: [{
        type: String,
        ref: 'Images'
    }],
    type: {
        type: String
    },
    current : {
        type: String,
        ref: 'Images',
        default : null
    },
    accepted: {
        type: Number,
        default: 0
    },
    rejected: {
        type: Number,
        default: 0
    },
    annotated: {
        type: Number,
        default: 0
    }
  },{ versionKey: false });

exports.Schema = TaskSchema;
