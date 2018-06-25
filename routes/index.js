const router = require('express').Router();

router.use('/friends', require('./friends'));
router.use('/trials', require('./trials'));

module.exports = router;