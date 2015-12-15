var express = require('express');

module.exports = function(req,res,next) {
	if(!req.session.isLoggedIn) {
		res.redirect('/');
	}
	else {
		var role = req.path.match(/\/api\/([^\/]+)/)[1];
		if(role != req.session.role)
			res.redirect('/');
		else
			next();
	}
};
