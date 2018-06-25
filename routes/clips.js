const router = require('express').Router();

const fileUpload = require('express-fileupload');

router.post('/upload', fileUpload(), function(req, res) {
	res.send(200);
});

module.exports = router;