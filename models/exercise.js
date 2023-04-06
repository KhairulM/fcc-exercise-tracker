const database = require('../database');

let exerciseSchema = new database.Schema({
  userid: {
    type: database.Schema.Types.ObjectId,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = database.model('Exercise', exerciseSchema);