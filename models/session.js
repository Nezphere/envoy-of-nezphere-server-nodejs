const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
	friend: ObjectId, hash: String, creation: Date, expiration: Date
});

module.exports = mongoose.model('Session', schema);