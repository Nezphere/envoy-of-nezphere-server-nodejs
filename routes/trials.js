const numeral = require('numeral');

const router = require('express').Router();

const Live = require('../models/live');
const Trial = require('../models/trial');
const Record = require('../models/record');

const secure = require('../middlewares/secure');

/**
 * /secure/trials/submit?hash&name&accuracy&performance&combo&score&perfect&great&good&bad&miss => 200
 */
router.post('/submit', secure, function(req, res, next) {
	const hash = String(req.body.hash);
	const name = String(req.body.name);
	const accuracy =    parseFloat(req.body.accuracy);
	// const performance = parseInt(req.body.performance);
	const combo =       parseInt(req.body.combo);
	const score =       parseInt(req.body.score);
	const perfect =     parseInt(req.body.perfect);
	const great =       parseInt(req.body.great);
	const good =        parseInt(req.body.good);
	const bad =         parseInt(req.body.bad);
	const miss =        parseInt(req.body.miss);

	var live, trial;

	Live.findOne({ hash }).exec().then(doc => {
		return doc ? doc : Live.create({ hash, name, creation: new Date(), creator: req.body.friend });
	}).then(doc => {
		live = doc;
		trial = {
			friend: req.body.friend._id, live: doc._id, completion: new Date(),
			accuracy, /*performance, */combo, score, perfect, great, good, bad, miss,
		};

		return Trial.create(trial);
	}).then(() => {
		return Record.findOne({ friend: trial.friend, live: trial.live }).exec();
	}).then(doc => {
		if (doc) {
			return score < doc.score ? null : doc.update({ $set: trial }).exec();
		} else {
			return Record.create(trial);
		}
	}).then(() => {
		return Record.aggregate([
			{ $match: { live: live._id, score: { $gt: score } } },
			{ $count: 'rank' },
		]);
	}).then(doc => {
		res.send(numeral((doc[0] && doc[0].rank || 0) + 1).format('0o').toUpperCase());
	}).catch(next);
});

/**
 * /secure/trials/high-score?hash
 */
router.post('/high-score', secure, function(req, res, next) {
	const hash = String(req.body.hash);

	Live.findOne({ hash }).exec().then(doc => {
		return !doc ? [] : Record.aggregate([
			{ $match: { live: doc._id } },
			{ $sort: { score: -1 } },
			{ $group: { _id: null, record: { $push: {
				_id: '$_id',
				score: '$score',
				friend: '$friend',
			} } } },
			{ $unwind: { path: '$record', includeArrayIndex: 'rank' } },
			{ $match: { 'record.friend': req.body.friend._id } },
			{ $project: {
				score: '$record.score',
				rank: '$rank',
			} },
		]).exec();
	}).then(docs => {
		res.send(
			(docs && docs[0] && `${numeral(docs[0].rank + 1).format('0o').toUpperCase()},${docs[0].score}`) || 
			'--,--');
	}).catch(next);
});

/**
 * /secure/trials/ranking?hash&count
 */
router.post('/ranking', function(req, res, next) {
	const hash = String(req.body.hash);
	const count = parseInt(req.body.count);

	Live.findOne({ hash }).exec().then(doc => {
		return !doc ? [] : Record.aggregate([
			{ $match: { live: doc._id } },
			{ $sort: { score: -1 } },
			{ $limit: count },
			{ $lookup: {
				from: 'friends',
				localField: 'friend',
				foreignField: '_id',
				as: 'friend',
			} },
			{ $unwind: { path: '$friend', includeArrayIndex: 'rank' } },
			{ $project: {
				_id: false,
				name: '$friend.name',
				score: '$score',
				rank: '$rank',
			} },
		]).exec();
	}).then(docs => {
		docs.forEach(doc => doc.rank = numeral(doc.rank + 1).format('0o').toUpperCase());
		res.send({ ranking: docs });
	}).catch(next);
});

module.exports = router;