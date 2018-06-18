const log = require('debug')('nezphere:server');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/nezphere', err => {
	log(err ? 'mongoose error' + err : 'mongoose connected');
});

const app = require('express')();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./routes');
app.use(routes);

app.use(function (err, req, res, next) {
	log('caught error: ' + err.stack);
	res.status(500).send({ error: err.stack });
	next();
});

const port = process.env.PORT || 3000;
app.listen(port);
log('server listens on port ' + port);