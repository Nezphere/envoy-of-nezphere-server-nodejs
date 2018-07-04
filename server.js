const log = require('debug')('nezphere:server');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nezphere', err => {
	log(err ? 'mongoose error' + err : 'mongoose connected');
});

const app = require('express')();
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const routes = require('./routes');
app.use('/v1', routes);

app.use(function (err, req, res, next) {
	log('caught error: ' + err.stack);
	res.status(500).send(err.stack);
	next();
});

const port = process.env.PORT || 3000;
app.listen(port);
log('server listens on port ' + port);