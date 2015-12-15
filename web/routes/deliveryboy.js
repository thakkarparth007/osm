var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');

var validateLogin = require('../middleware/validateLogin');

function getDeliveryBoy(id) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('deliveryBoys').findOne({
				_id: id
			});
		 });
}

router.post('/placesToVisit', function(req, res, next) {
	validateLogin(req.body.username, req.body.password, 'deliveryboy', function(err, obj) {
		if(err) {
			res.status(500).end();
			return;
		}
		console.log(req.body);
		getDeliveryBoy(obj.collectionID)
			 .then(function(obj) {
			 	console.log(obj);
			 	for(var i = 0; i < obj.stuffToDeliver.length; i++) {
			 		obj.stuffToDeliver[i].orderId = obj.stuffToDeliver[i].orderID;
			 	}
				res.json({
					api_call_status: "success",
					numberOfPlaces: obj.stuffToDeliver.length,
					places: obj.stuffToDeliver
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
	validateLogin(req.body.username, req.body.password, 'deliveryboy')
		.then(function(_obj) {
			return getDeliveryBoy(_obj.collectionID);
		})
		.then(function(_obj) {
			obj = _obj;
			var i = 0;
			for( ; i < obj.stuffToDeliver.length; i++) {
				if(obj.stuffToDeliver[i].orderID == req.body.orderId) {
					break;
				}
			}
			if(i == obj.stuffToDeliver.length) {
				console.log(obj.stuffToDeliver);
				throw new Error("Order ID doesn't exist in stuffToDeliver");
			}
			orderId_index = i;
			return validateLogin(req.body.consumerUsername, req.body.consumerPassword, 'homedelivery');
		})
		.then(function(user) {
			if(!user || user.username != obj.stuffToDeliver[orderId_index].consumerID) {
				throw new Error("bad_consumer_credentials");
			}
			obj.stuffDelivered.push( obj.stuffToDeliver.splice(orderId_index,1) );
			return db_connect.reuse().then(function(db) {
				return db.collection('deliveryBoys').updateOne({
					_id: obj._id
				}, {
					$set: {
						stuffToDeliver: obj.stuffToDeliver,
						stuffDelivered: obj.stuffDelivered
					}
				});
			});
		})
		.then(function(re) {
			if(re.modifiedCount != 1) throw new Error("Some BS has occurred - deliveryboy.js - /order");
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
