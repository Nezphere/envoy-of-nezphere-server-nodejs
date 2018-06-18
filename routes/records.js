const router = require('express').Router();

const Live = require('../models/live');
const Record = require('../models/record');

/**
 * /secure/records/submit?hash&name&accuracy&performance&combo&score&perfect&great&good&bad&miss => 200
 */
router.post('/submit', function(req, res, next) {
	const hash = String(req.body.hash);
	const name = String(req.body.name);
	const accuracy =    parseFloat(req.body.accuracy);
	const performance = parseInt(req.body.performance);
	const combo =       parseInt(req.body.combo);
	const score =       parseInt(req.body.score);
	const perfect =     parseInt(req.body.perfect);
	const great =       parseInt(req.body.great);
	const good =        parseInt(req.body.good);
	const bad =         parseInt(req.body.bad);
	const miss =        parseInt(req.body.miss);

	Live.findOne({ hash }).exec().then(doc => {
		return doc ? doc : Live.create({ hash, name, creation: new Date(), creator: req.body.friend });
	}).then(doc => {
		return Record.create({
			friend: req.body.friend._id, live: doc._id, completion: new Date(),
			accuracy, performance, combo, score, perfect, great, good, bad, miss,
		});
	}).then(() => {
		res.sendStatus(200);
	}).catch(next);
});

/**
 * /secure/records/rank?hash&count
 */
router.post('/rank', function(req, res, next) {
	const hash = String(req.body.hash);
	const count = parseInt(req.body.count);

	Live.findOne({ hash }).exec().then(doc => {
		return !doc ? [] : Record.aggregate([
			{ $match: { live: doc._id } },
			{ $sort: { score: -1 } },
			{ $group: {
				_id: '$friend',
				accuracy: { $first: '$accuracy' },
				performance: { $first: '$performance' },
				combo: { $first: '$combo' },
				score: { $first: '$score' },
			} },
			{ $limit: count },
			{ $lookup: {
				from: 'friends',
				localField: '_id',
				foreignField: '_id',
				as: 'friend',
			} },
			{ $unwind: '$friend' },
			{ $project: {
				_id: 0,
				friend: {
					_id: 0, salt: 0, hash: 0, __v: 0,
				},
			} },
		]).exec();
	}).then(docs => {
		res.send(docs);
	}).catch(next);
});

module.exports = router;