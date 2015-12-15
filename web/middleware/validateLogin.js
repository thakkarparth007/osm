var db_connect = require('../db_connect');

function validateLogin(uname, pwd, role, cb) {
	if(cb) {
		db_connect.reuse(function(db) {
			db.collection('logins').findOne({
				username: uname,
				password: pwd,
				role: role
			}, function(err, user) {
				if(err) {
					console.log(err);
					cb(err);
				}
				else {
					cb(null, user);
				}
			});
		});
	}
	else {
		return db_connect.reuse().then(function(db) {
			return db.collection('logins').findOne({
				username: uname,
				password: pwd,
				role: role
			});
		});
	}
}

module.exports = validateLogin;