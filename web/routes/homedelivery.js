var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');

/*
{
	name: <string>,
	phoneNumber: <string>,
	address: {
		addr1: <string>,
		addr2: <string>,
		city: <string>,
		state: <string>
	}
}
 */
function register(obj) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('consumers').insertOne(obj);
		 })
		 .then(function(result) {
			return db.collection('logins').insertOne({
				username: obj.aadharId,
				password: obj.password,
				role: 'homedelivery',
				collectionID: result.insertedId
			});
		});
}

function getInventory() {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('prices').find(
				{}, 
				{
					"date": 1, 
					"prices.item": 1, 
					"prices.consumerPrice": 1
				}
			).toArray();
		})
		.then(function(arr) {
			var price = "";
			for(var i = 0; i < arr.length; i++)
				if(!price || price.date < arr[i].date)
					price = arr[i];
			for(var i = 0; i < price.prices.length; i++) {
				price.prices[i].name = price.prices[i].item;
				price.prices[i].price = price.prices[i].consumerPrice;
			}
			return price;
		});
}

function addrToStr(addr) {
	return [addr.addr1, addr.addr2, addr.village, addr.district, addr.state].join(",\n");
}

function getConsumerProfile(username) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			console.log('yolo', username, {
				username: username,
				role: 'homedelivery'
			});
			return db.collection('logins').findOne({
				username: username,
				role: 'homedelivery'
			});
		})
		.then(function(obj) {
			return db.collection('consumers').findOne({
				_id: obj.collectionID
			});
		});
}

function acceptOrder(consumerProfile, order) {
	var db = null;
	var zone, orderID, orderObj;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('deliveryZones').findOne({
				"areas": consumerProfile.address.addr2
			});
		})
		.then(function(_zone) {
			zone = _zone;
			return db.collection('HDOrders').count();
		})
		.then(function(_orderID) {
			orderID = (parseInt(_orderID)+1) + "";
			orderObj = {
				orderID: orderID,
				orderTime: new Date(),
				consumerID: consumerProfile.aadharID,
				consumerName: consumerProfile.name,
				address: addrToStr(consumerProfile.address),
				zoneID: zone._id,
				orderList: order.items
			};
			return db.collection('HDOrders').insertOne(orderObj);
		})
		.then(function() {
			return db.collection('deliveryBoys').update({
				zoneID: zone._id
			}, {
				$push: {
					stuffToDeliver: orderObj
				}
			});
		});
}

/* register page */
router.post('/register', function(req, res, next) {
	register(req.body).then(function(obj) {
		res.json({
			api_call_status: obj ? "success" : "failure"
		});
	}).catch(function(err) {
		console.log(arguments);
		res.status(500).end();
	})
});

router.post('/inventory', function(req, res, next) {
	getInventory().then(function(val) {
		res.json(val);
	});
});

router.post('/buy', function(req, res, next) {
	getConsumerProfile(req.session.username)
		.then(function(profile) {
			if(!profile) throw Error("Bad credentials");
			return acceptOrder(profile, req.body);
		})
		.then(function(obj) {
			res.json({ api_call_status: obj ? "success" : "failure" });
		})
		.catch(function(err) {
			console.log(err);
			res.status(500).end();
		});
});

module.exports = router;
