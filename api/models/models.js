'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var uuid = require('uuid');

var UserSchema = new Schema({
    _id: { type: String, default: function genUUID() {
        return  uuid.v1();
    }},
    fullname: String,
    password: String,
    username: String,
    type: String,
    APIKey: String,
    APIToken: [String]
},{ versionKey: false });
UserSchema.index({ username: 1, APIKey: 1 }, { unique: true });


var CampaignSchema = new Schema({
  _id: { type: String, default: function genUUID() {
       return  uuid.v1();
  }},
  _id_master: { type: String, ref: 'User' },
  name: String,
  status: String,

  selection_replica: Number,
  threshold: Number,
  annotation_replica: Number,
  annotation_size: Number,

  //cosi memorizzo quali worker sono abilitati per annotation e selection
  annotation_workers : [String],
  selection_workers : [String]

  //le statistiche vanno calcolate di volta in volta a seconda delle immagini
  //collegate alla campagna
},{ versionKey: false });

var ImageSchema = new Schema({
  _id: { type: String, default: function genUUID() {
       return  uuid.v1();
  }},
  _id_campaign: { type: String, ref: 'Campaign' },
  canonical: String,
  selection: {
      accepted: { type: Number, default: 0},
      rejected: { type: Number, default: 0}
  },
  annotation: [String]
},{ versionKey: false });

var TaskSchema = new Schema({
  _id: { type: String, default: function genUUID() {
       return  uuid.v1();
  }},
  _id_campaign: { type: String, ref: 'Campaign' },
  _id_worker: { type: String, ref: 'User' },
  type: String,
  current : { type: String, ref: 'Image' },
  done : Boolean,
  //lista delle immagini della stessa campagna per le quali il woker è stato abilitato
  _id_images: [{ type: String, ref: 'Image' }],

  //gestione delle statistiche del Task
  //ogni volta che viene mandato un risultato lo aggiorno
  accepted: Number,
  rejected: Number,
  annotated: Number
},{ versionKey: false });

module.exports = mongoose.model('Users', UserSchema);
module.exports = mongoose.model('Campaigns', CampaignSchema);
module.exports = mongoose.model('Images', ImageSchema);
module.exports = mongoose.model('Tasks', TaskSchema);
