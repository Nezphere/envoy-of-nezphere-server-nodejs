const mongoose = require('mongoose');

const ObjectId = mongoose.SchemaTypes.ObjectId;

const schema = new mongoose.Schema({
	name: String, hash: String,
	creation: Date, creator: ObjectId,
});

module.exports = mongoose.model('Live', schema);