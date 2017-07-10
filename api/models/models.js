'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('uuid');

var UserSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    fullname: {
        type : String,
        validate: {
            validator: function(v) {
                return v.length >= 3 ;
            },
            message: 'does not meet minimum length of 3'
        },
        required: [true, 'is required']
    },
    username: {
        type : String,
        validate: {
            validator: function(v) {
                return v.length >= 3 ;
            },
            message: 'does not meet minimum length of 3'
        },
        required: [true, 'is required']
    },
    password: {
        type : String,
        validate: {
            validator: function(v) {
                return v.length >= 8 ;
            },
            message: 'does not meet minimum length of 8'
        },
        required: [true, 'is required']
    },
    type: {
        type: String,
        enum:  {
            values: ['master', 'worker'],
            message: 'is not one of enum values: master, worker'
        },
        required: [true, 'is required']
    },
    APIKey: {
        type : String
    },
    APIToken: [String]
},{ versionKey: false });

UserSchema.index({ username: 1, APIKey: 1 }, { unique: true });

UserSchema.post('save', function(error, doc, next) {
    if (error){
        var err = {};
        for (var key in error.errors) {
            err[key] = error.errors[key].message;
        }
        next(new Error(JSON.stringify(err)));
    } else {
        next(error);
    }
});

UserSchema.methods.addToken = function (cb) {
    var token = uuid.v1();

    // add the token to the user's tokens
    this.APIToken.push(token);

    // save the updated user
    this.save(function (err) {
        if (err) {
            cb(err,null);
        } else {
            cb(null,{token: token});
        }
    });
};

UserSchema.methods.deleteToken = function (APIToken,cb) {
    var index = this.APIToken.indexOf(APIToken);

    // remove the token from the array
    this.APIToken.splice(index, 1);

    // save the updated user
    this.save(function (err) {
        //error in the query (I hope never happen)
        if (err) {
            cb(err,null);
        } else {
            cb(null,{});
        }
    });
};

UserSchema.methods.changeInfo = function (infos,cb) {

    if (infos.fullname){
        this.fullname = infos.fullname;
    }
    if (infos.password){
        this.password = infos.password;
    }

    // save the updated user
    this.save(function (err) {

      if (err) {
          cb(err,null);
      } else {
          cb(null,{});
      }
    });
};








































var CampaignSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_master: {
        type: String,
        required: true,
        ref: 'User'
    },
    name: {
        type : String,
        validate: {
            validator: function(v) {
                return v.length >= 3 ;
            },
            message: 'does not meet minimum length of 3'
        },
        required: [true, 'is required']
    },
    status: {
        type: String,
        default: 'ready',
        enum:  {
            values: ['ready', 'started', 'ended'],
        }
    },
    selection_replica: {
        type: String,
        validate: [{
            validator: function(v) {
                return !isNaN(v);
            },
            message: 'is not of a type(s) integer'
        },
        {
            validator: function(v) {
                return v >= 1 ;
            },
            message: 'must have a minimum value of 1'
        }],
        required: [true, 'is required']
    },
    threshold: {
        type: String,
        validate: [{
            validator: function(v) {
                return !isNaN(v);
            },
            message: 'is not of a type(s) integer'
        },
        {
            validator: function(v) {
                return v >= 1 ;
            },
            message: 'must have a minimum value of 1'
        }],
        required: [true, 'is required']

    },
    annotation_replica: {
        type: String,
        validate: [{
            validator: function(v) {
                return !isNaN(v);
            },
            message: 'is not of a type(s) integer'
        },
        {
            validator: function(v) {
                return v >= 1 ;
            },
            message: 'must have a minimum value of 1'
        }],
        required: [true, 'is required']
    },
    annotation_size: {
        type: String,
        validate: [{
            validator: function(v) {
                return !isNaN(v);
            },
            message: 'is not of a type(s) integer'
        },
        {
            validator: function(v) {
                return v >= 1 ;
            },
            message: 'must have a minimum value of 1'
        },
        {
            validator: function(v) {
                return v <= 10 ;
            },
            message: 'must have a maximum value of 10'
        }],
        required: [true, 'is required']
    },

},{ versionKey: false });

CampaignSchema.post('save', function(error, doc, next) {
    if (error){
        var err = {};
        for (var key in error.errors) {
            err[key] = error.errors[key].message;
        }
        next(new Error(JSON.stringify(err)));
    } else {
        next(error);
    }
});

CampaignSchema.methods.changeDetails = function (details,cb) {
    if (details.name){
        this.name = details.name;
    }
    if (details.selection_replica){
        this.selection_replica = details.selection_replica;
    }
    if (details.threshold){
        this.threshold = details.threshold;
    }
    if (details.annotation_replica){
        this.annotation_replica = details.annotation_replica;
    }
    if (details.annotation_size){
        this.annotation_size = details.annotation_size;
    }

    // save the updated user
    this.save(function (err) {

        if (err) {
            cb(err,null);
        } else {
            cb(null,{});
        }
    });
};


CampaignSchema.methods.start = function (cb) {
    if(this.status == 'ready'){

        this.status = 'started';
        // save the updated user
        this.save(function (err) {

            if (err) {
                cb(err,null);
            } else {
                cb(null,{});
            }
        });
    } else {

        cb(new Error(),null);
    }

};

CampaignSchema.methods.terminate = function (cb) {
    if(this.status == 'started'){

        this.status = 'ended';
        // save the updated user
        this.save(function (err) {

            if (err) {
                cb(err,null);
            } else {
                cb(null,{});
            }
        });
    } else {

        cb(new Error(),null);
    }

};




















var ImageSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_campaign: {
        type: String,
        required: true,
        ref: 'Campaign'
    },
    canonical: {
        type: String,
        required: true
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

ImageSchema.post('save', function(error, doc, next) {
    if (error){
        var err = {};
        for (var key in error.errors) {
            err[key] = error.errors[key].message;
        }
        next(new Error(JSON.stringify(err)));
    } else {
        next(error);
    }
});

ImageSchema.methods.annotate = function (annotation,cb) {
    if (annotation.skyline){
        this.annotation.push(annotation.skyline);

        // save the updated user
        this.save(function (err) {

            if (err) {
                cb(err,null);
            } else {
                cb(null,{});
            }
        });

    } else {
        cb(new Error(),null);
    }
};

ImageSchema.methods.select = function (selection,cb) {
    if (selection.accepted === true){
        this.selection.accepted = parseInt(this.selection.accepted) + 1;
    } else {
        this.selection.rejected = parseInt(this.selection.rejected) + 1;
    }

    // save the updated user
    this.save(function (err) {

        if (err) {
            cb(err,null);
        } else {
            cb(null,{});
        }
    });

};






var TaskSchema = new Schema({
    _id: {
        type: String,
        default: function genUUID() {
           return  uuid.v1();
        }
    },
    _id_campaign: {
        type: String,
        required: true,
        ref: 'Campaigns'
    },
    _id_worker: {
        type: String,
        required: true,
        ref: 'Users'
    },
    _id_images: [{
        type: String,
        required: true,
        ref: 'Images'
    }],
    type: {
        type: String,
        enum:  {
            values: ['annotation', 'selection'],
            message: 'is not one of enum values: annotation, selection'
        },
        required: [true, 'is required']
    },
    current : {
        type: String,
        ref: 'Images',
        default : null
    },

    //gestione delle statistiche del Task
    //ogni volta che viene mandato un risultato lo aggiorno
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

  TaskSchema.post('save', function(error, doc, next) {
      if (error){
          var err = {};
          for (var key in error.errors) {
              err[key] = error.errors[key].message;
          }
          next(new Error(JSON.stringify(err)));
      } else {
          next(error);
      }
  });

module.exports = mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Campaigns', CampaignSchema);
module.exports = mongoose.model('Images', ImageSchema);
module.exports = mongoose.model('Tasks', TaskSchema);
