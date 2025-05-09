const mongoose1 = require('mongoose'); // 필수

const userSchema = new mongoose1.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose1.model('User', userSchema);