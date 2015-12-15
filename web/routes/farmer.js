var express = require('express');
var router = express.Router();
var db_connect = require('../db_connect');

/*
{
	aadharId: <string>,
	password: <string>,
	name: <string>,
	residentialAddress: {
		addr1: <string>,
		addr2: <string>,
		village: <string>,
		district: <string>,
		state: <string>
	},
	farmAddresses: [{
		addr1: <string>,
		addr2: <string>,
		village: <string>,
		district: <string>,
		state: <string>
	}],
	phoneNumber: <string>
}
 */
function register(obj) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('farmers').insertOne(obj);
		 })
		 .then(function(result) {
			return db.collection('logins').insertOne({
				username: obj.aadharId,
				password: obj.password,
				role: 'farmer',
				collectionID: result.insertedId
			});
		});
}

function getPriceList() {
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
					"prices.farmerPrice": 1
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
				price.prices[i].price = price.prices[i].farmerPrice;
			}
			return price;
		});
}

function addrToStr(addr) {
	return [addr.addr1, addr.addr2, addr.village, addr.district, addr.state].join(",\n");
}

function getFarmerProfile(username) {
	var db = null;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('farmers').findOne({
				aadharID: username
			});
		});
}

function acceptOrder(farmerProfile, order) {
	var db = null;
	var zone, orderID;
	var orderObj;
	return db_connect
		.reuse()
		.then(function(_db) {
			db = _db;
			return db.collection('farmerZones').findOne({
				"areas": farmerProfile.farmAddresses[0].village
			});
		})
		.then(function(_zone) {
			zone = _zone;
			return db.collection('farmerOrders').count();
		})
		.then(function(_orderID) {
			orderID = (parseInt(_orderID)+1) + "";
			orderObj = {
				orderID: orderID,
				orderTime: new Date(),
				farmerID: farmerProfile.aadharID,
				farmerName: farmerProfile.name,
				address: addrToStr(farmerProfile.farmAddresses[0]),
				zoneID: zone._id,
				orderList: order.orderList
			};
			return db.collection('farmerOrders').insertOne(orderObj);
		})
		.then(function() {
			return db.collection('qcBoys').update({
				zoneID: zone._id
			}, {
				$push: {
					stuffToPick: orderObj
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

router.post('/priceList', function(req, res, next) {
	getPriceList().then(function(val) {
		res.json(val);
	});
});

router.post('/order', function(req, res, next) {
	getFarmerProfile(req.session.username)
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
