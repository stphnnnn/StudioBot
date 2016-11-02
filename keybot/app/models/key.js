var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  user: { type: String },
  claimed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Key', keySchema);
