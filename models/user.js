const database = require('../database');

let userSchema = new database.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
});

module.exports = database.model('User', userSchema);