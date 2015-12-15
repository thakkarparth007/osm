var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');

var validateLogin = require('../middleware/validateLogin');

/* login page */
router.post('/:role', function(req, res, next) {
	validateLogin(req.body.username, req.body.password, req.params.role)
		.then(function(obj) {
			if(obj && /^(farmer|billing|homedelivery)$/.test(req.params.role)) {
				req.session.isLoggedIn = true;
				req.session.username = req.body.username;
				req.session.role = req.params.role;
			}

			res.json({
				api_call_status: obj ? "success" : "failure"
			})
		})
		.catch(function(err) {
			res.status(500).end();
		});
});


module.exports = router;
