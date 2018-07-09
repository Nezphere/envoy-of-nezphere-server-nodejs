const crypto = require('crypto');

/**
 * @param {Number} length 
 */
exports.randomString = function(length) {
	return crypto.randomBytes(length).toString('base64');
};

/**
 * @param {String} text 
 * @param {String} salt
 */
exports.hmacSha512 = function(text, salt) {
	const hash = crypto.createHmac('sha512', salt);
	hash.update(text);
	return hash.digest('base64');
};

exports.sha256 = function(data) {
	const hash = crypto.createHash('sha256');
	hash.update(data);
	return hash.digest('hex');
};