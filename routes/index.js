const router = require('express').Router();

router.use('/friends/', require('./friends'));

module.exports = router;