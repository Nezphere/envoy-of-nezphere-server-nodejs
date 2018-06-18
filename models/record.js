const mongoose = require('mongoose');

const ObjectId = mongoose.SchemaTypes.ObjectId;

const schema = new mongoose.Schema({
	friend: ObjectId, live: ObjectId,
	completion: Date,

	accuracy: Number, performance: Number,
	combo: Number, score: Number,
	perfect: Number, great: Number, good: Number, bad: Number, miss: Number,
});

module.exports = mongoose.model('Record', schema);