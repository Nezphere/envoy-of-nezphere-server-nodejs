// const log = require('debug')('nezphere:routes:friends');

const Friend = require('../models/friend');
const Session = require('../models/session');

const router = require('express').Router();

const { randomString, hmacSha512 } = require('../utils/hashing');
const { FRIEND_SALT_LENGTH, FRIEND_NAME_LENGTH_MIN, FRIEND_PASS_LENGTH_MIN, SESSION_HASH_LENGTH, SESSION_EXPIRATION_INTERVAL } = require('../utils/constants');

/**
 * post /public/login?name&pass    => { session }
 */
router.post('/login', function(req, res, next) {
	const name = String(req.body.name || '').toLowerCase();
	const pass = String(req.body.pass || '');
	var friend, now;

	Friend.findOne({ name }).exec().then(doc => {
		if (!doc) throw new Error('friend does not exist: ' + name);
		
		const hash = hmacSha512(pass, doc.salt);
		if (hash === doc.hash) {  // invalidate old session
			friend = doc;
			now = new Date();
			return Session.updateMany({ friend: doc._id, expiration: { $gt: now } }, { $set: { expiration: now } }).exec();
		} else throw new Error('wrong pass');
	}).then(() => {
		const expiration = new Date();
		expiration.setTime(now.getTime() + SESSION_EXPIRATION_INTERVAL);
		
		return Session.create({
			friend: friend._id,
			hash: randomString(SESSION_HASH_LENGTH),
			creation: now, expiration,
		});
	}).then(session => {
		res.send(session.hash);
	}).catch(next);
});

/**
 * post /public/register?name&pass => 200
 */
router.post('/register', function(req, res, next) {
	const name = String(req.body.name || '').trim().toLowerCase();
	const pass = String(req.body.pass || '');

	if (/[\x00-\x1f\7f:|,]/.test(name)) return next(new Error('name contains illegal character: ' + name));
	if (name.length < FRIEND_NAME_LENGTH_MIN) return next(new Error('name is too short: ' + name));
	if (pass.length < FRIEND_PASS_LENGTH_MIN) return next(new Error('pass is too short: ' + pass));

	Friend.findOne({ name }).exec().then(friend => {
		if (friend) throw new Error('friend already exists: ' + name);

		const salt = randomString(FRIEND_SALT_LENGTH);
		const hash = hmacSha512(pass, salt);
		return Friend.create({ name, salt, hash });
	}).then(() => {
		res.sendStatus(200);
	}).catch(next);
});

module.exports = router;