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


exports.Schema = CampaignSchema;
