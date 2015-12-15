var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/logout', function(req,res,next) {
	req.session.destroy();
	res.redirect('/snapchallenge');
	res.end();
});

module.exports = router;
