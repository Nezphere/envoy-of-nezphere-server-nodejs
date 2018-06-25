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
		this.trial = {
			friend: req.body.friend._id, live: doc._id, completion: new Date(),
			accuracy, performance, combo, score, perfect, great, good, bad, miss,
		};

		return Trial.create(this.trial);
	}).then(() => {
		return Record.findOne({ friend: this.trial.friend, live: this.trial.live }).exec();
	}).then(doc => {
		if (doc) {
			return score < doc.score ? null : doc.update({ $set: this.trial }).exec();
		} else {
			return Record.create(this.trial);
		}
	}).then(() => {
		res.sendStatus(200);
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
		res.send(docs);
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
				friend: '$friend.name',
				score: '$score',
				rank: '$rank',
			} },
		]).exec();
	}).then(docs => {
		res.send(docs);
	}).catch(next);
});

module.exports = router;