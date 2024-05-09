const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  documents: [{
    filename: String,
    contentType: String,
    data: Buffer,
    text: String,
    category: String,
  }],
});

module.exports = mongoose.model('User', userSchema);
