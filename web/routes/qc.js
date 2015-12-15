var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');

var validateLogin = require('../middleware/validateLogin');

function getQCBoy(id) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('qcBoys').findOne({
				_id: id
			});
		 });
}

router.post('/placesToVisit', function(req, res, next) {
	validateLogin(req.body.username, req.body.password, 'qc', function(err, obj) {
		if(err) {
			res.status(500).end();
			return;
		}

		console.log(req.body);

		if(!obj) {
			res.json({
				"api_call_status": "failure" 
			});
			return;
		}

		getQCBoy(obj.collectionID)
			 .then(function(obj) {
			 	console.log(obj);
			 	for(var i = 0; i < obj.stuffToPick.length; i++) {
			 		obj.stuffToPick[i].orderId = obj.stuffToPick[i].orderID;
			 	}
				res.json({
					api_call_status: "success",
					numberOfPlaces: obj.stuffToPick.length,
					places: obj.stuffToPick
				});
			})
			.catch(function(err) {
				console.log(err);
				res.status(500).end();
			});
	});
});

router.post('/order', function(req, res, next) {
	var orderId_index, obj;
	validateLogin(req.body.username, req.body.password, 'qc')
		.then(function(_obj) {
			return getQCBoy(_obj.collectionID);
		})
		.then(function(_obj) {
			obj = _obj;
			var i = 0;
			for( ; i < obj.stuffToPick.length; i++) {
				if(obj.stuffToPick[i].orderID == req.body.orderID) {
					break;
				}
			}
			if(i == obj.stuffToPick.length) {
				console.log(obj.stuffToPick);
				throw new Error("Order ID doesn't exist in stuffToPick");
			}
			orderId_index = i;
			return validateLogin(req.body.farmerUsername, req.body.farmerPassword, 'farmer');
		})
		.then(function(user) {
			if(!user || user.username != obj.stuffToPick[orderId_index].farmerID) {
				throw new Error("bad_farmer_credentials");
			}
			obj.stuffPicked.push( obj.stuffToPick.splice(orderId_index,1) );
			return db_connect.reuse().then(function(db) {
				return db.collection('qcBoys').updateOne({
					_id: obj._id
				}, {
					$set: {
						stuffToPick: obj.stuffToPick,
						stuffPicked: obj.stuffPicked
					}
				});
			});
		})
		.then(function(re) {
			if(re.modifiedCount != 1) throw new Error("Some BS has occurred - QC.js - /order");
			res.json({
				api_call_status: "success"
			});
		})
		.catch(function(err) {
			console.log(err);
			res.status(500).end();
		});
});

module.exports = router;
