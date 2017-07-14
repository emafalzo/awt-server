var uuid = require('uuid'),
    Schema = require('mongoose').Schema;

var UserSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    fullname: {
        type : String
    },
    username: {
        type : String
    },
    password: {
        type : String
    },
    type: {
        type: String
    },
    APIKey: {
        type : String
    },
    APIToken: [String]
},{ versionKey: false });

UserSchema.index({ username: 1, APIKey: 1 }, { unique: true });

exports.Schema = UserSchema;
