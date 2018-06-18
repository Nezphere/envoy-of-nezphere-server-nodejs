const router = require('express').Router();

const Session = require('../models/session');
const Friend = require('../models/friend');

router.use(function(req, res, next) {
	const session = String(req.body.session || '');

	if (!req.body.session) return next(new Error('no session provided'));
	Session.findOne({ hash: session, expiration: { $gt: new Date() } }).exec().then(doc => {
		if (!doc) throw new Error('no valid session found: ' + session);

		return Friend.findById(doc.friend);
	}).then(doc => {
		if (!doc) throw new Error('no friend found');
		
		req.body.friend = doc;
		next();
	}).catch(next);
});

router.use('/clips/', require('./clips'));
router.use('/records/', require('./records'));

router.post('/', function(req, res) {
	res.sendStatus(200);
});

module.exports = router;