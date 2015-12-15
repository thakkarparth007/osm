var express = require('express');
var multer = require('multer');
var db_connect = require('../db_connect');
var config = require('../config');
var router = express.Router();

function getFileName(req, file, cb) {
	var name = req.body.name.substr(0, 15)
	var ext = file.originalname.match(/(\.[^\.]+)$/)[1];

	req.__stored_name = Date.now() + "-" + name + "-" + req.body.contact + ext;
	cb(null, req.__stored_name);
}

var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads');
	},
	filename: getFileName
});

var upload = multer({
	storage: storage,
	limits: {
		fileSize: config.uploadLimit
	},
	fileFilter: function(req, file, cb) {
		var errors = {};

		req.session.name = req.body.name;
		req.session.contact = req.body.contact;
		req.session.college = req.body.college;

		if(!/^[a-zA-Z \.']+$/.test(req.body.name)) {
			errors.name = 'Please enter a valid name';
		}
		if(!/^\d{10}$/.test(req.body.contact)) {
			errors.contact = 'Please enter a valid 10 digit mobile number';
		}
		if(!/^image\//.test(file.mimetype)) {
			errors.pic = 'Please upload a valid image, smaller than ' + config.uploadLimit / 1024 / 1024 + ' MB';
		}
		// college can be anything.
		if (errors.name || errors.contact || !/^image\//.test(file.mimetype)) {
			cb(errors);	
		}
		else {
			cb(null, true);
		}

	}
}).single('pic');

router.get('/', function(req, res, next) {
	res.render('home', {
		config: config,
		session: req.session,
		done: false
	});
});

router.post('/', function(req, res, next) {
	upload(req, res, function(err) {
		if(!req.file) {
			err = err || {};
			err.pic = 'Please upload a valid image, smaller than ' + config.uploadLimit / 1024 / 1024 + ' MB';
		}

		if(err) {
			res.render('home', {
				config: config,
				session: req.session, 
				errors: err,
				done: false
			});
		}
		else {
			res.render('home', {
				config: config,
				session: req.session, 
				errors: err,
				done: true
			});

			db_connect.reuse(function(db) {
				db.collection('uploads').insertOne({
					name: req.body.name,
					contact: req.body.contact,
					college: req.body.college,
					picName: req.__stored_name,
					caption: req.body.caption
				});
			});
		}
	});
});

module.exports = router;
