const router = require('express').Router();

router.use('/friends', require('./friends'));
router.use('/trials', require('./trials'));
router.use('/images', require('./images'));

module.exports = router;