const router = require('express').Router();

router.use('/', require('./friends'));
router.use('/secure/', require('./secure'));

module.exports = router;