var express = require('express');
var db_connect = require('../db_connect');
var config = require('../config');
var router = express.Router();

router.get('/', function(req, res, next) {
	db_connect.reuse(function(db) {
		db.collection('uploads').find({}).toArray(function(err, uploads) {
			res.render('admin', {
				row: uploads
			});
		});
	});
});

module.exports = router;

