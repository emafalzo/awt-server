var uuid = require('uuid'),
    Schema = require('mongoose').Schema;

var ImageSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_campaign: {
        type: String,
        ref: 'Campaign'
    },
    canonical: {
        type: String
    },
    selection: {
        accepted: {
            type: Number,
            default: 0
        },
        rejected: {
            type: Number,
            default: 0
        }
    },
    annotation: [String]
},{ versionKey: false });

ImageSchema.virtual('selection_replica').get(function () {
    return this.selection.accepted + this.selection.rejected;
});

ImageSchema.virtual('threshold').get(function () {
    return this.selection.accepted;
});

ImageSchema.virtual('annotation_replica').get(function () {
    return this.annotation.length;
});

exports.Schema = ImageSchema;
