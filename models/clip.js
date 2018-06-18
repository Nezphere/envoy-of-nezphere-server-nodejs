const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: String, hash: String, path: String,
});

module.exports = mongoose.model('Clip', schema);