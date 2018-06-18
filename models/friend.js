const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: String, hash: String, salt: String,
});

module.exports = mongoose.model('Friend', schema);