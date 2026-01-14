const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  photo: {
    type: String,
    default: 'https://i.imgur.com/JUZSO7r.png',
  },
  bio: {
    type: String,
    default: 'A hospital dedicated to providing the best healthcare services.',
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

module.exports = mongoose.model('Hospital', HospitalSchema);
