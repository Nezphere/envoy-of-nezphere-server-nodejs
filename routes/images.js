const router = require('express').Router();

const fileUpload = require('express-fileupload');
const Image = require('../models/image');
const sharp = require('sharp');
const { sha256 } = require('../utils/hashing'); 
const { appRoot } = require('../global');
const path = require('path');

router.post('/upload', fileUpload(), function(req, res) {
	if (!req.files || !req.files.image) return res.sendStatus(500);

	var meta, hash, imageDoc;
	// @ts-ignore
	sharp(req.files.image.data).metadata().then(metadata => {
		meta = metadata;
		// @ts-ignore
		hash = sha256(req.files.image.data);
		return Image.findOne({ hash });
	}).then(doc => {
		if (doc) return res.send(doc.path);
		return Image.create({
			// @ts-ignore
			name: req.files.image.name, hash, 
			format: meta.format, width: meta.width, height: meta.width,
			submission: new Date(),
		}).then(doc => {
			imageDoc = doc;
			// @ts-ignore
			return req.files.image.mv(path.join(appRoot, 'uploads', doc.path));
		}).then(() => {
			return res.send(imageDoc.path);
		});
	});
});

module.exports = router;