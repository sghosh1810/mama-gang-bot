const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
  author : {
    type: String,
    default: 'Mama Gang Bot'
  }
});

const Announcements = mongoose.model('Announcements', UrlSchema);

module.exports = Announcements;