const router = require('express').Router();

const fileUpload = require('express-fileupload');

router.post('/upload', fileUpload(), function(req, res, next) {
	
});

module.exports = router;