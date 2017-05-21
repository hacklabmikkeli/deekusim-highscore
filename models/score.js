const mongoose = require('mongoose');

var scoreSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  score : {
    type: Number,
    required: true
  },
  created: {
    type: Date
  }
});

module.exports = mongoose.model('Score', scoreSchema);