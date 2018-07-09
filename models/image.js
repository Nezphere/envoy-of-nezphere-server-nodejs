const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	name: String, hash: String, 
	format: String, width: Number, height: Number,
	submission: Date,
});

schema.virtual('path').get(function () {
	return this.hash + '.' + this.format;
});

module.exports = mongoose.model('Image', schema);