/*$.mockjax({
	"url": "/api/farmer/priceList",
	"type": "post",
	"responseText": {
		"numberOfItems": 6,
		"priceList": [
		{
			"name": "swag",
			"price": 180.0,
		},
		{
			"name": "penguin",
			"price": 140.2,
		},
		{
			"name": "mother",
			"price": 180.0,
		},
		{
			"name": "coolio",
			"price": 140.2,
		},
		{
			"name": "noob",
			"price": 180.0,
		},
		{
			"name": "hsmf",
			"price": 140.2,
		}]
	}
});

$.mockjax({
	"url": "/api/farmer/order",
	"type": "post",
	"responseText": "swag"
});
*/
function ShoppingCart(attache, renderer) {
	this.attache = attache
	this.cartItems = [];
	this.renderer = renderer;
}

ShoppingCart.prototype.addItem = function(item) {
	var len = this.cartItems.length;
	for (var i = 0; i <  len; ++i) {
		if (this.cartItems[i].name == item.name) {
			this.cartItems[i].weight = parseInt(this.cartItems[i].weight) + parseInt(item.weight);
			return;
		}
	}
	this.cartItems.push(item);
}

ShoppingCart.prototype.removeItem = function(itemName) {
	var len = this.cartItems.length;
	for (var i = 0; i < len; ++i) {
		if (this.cartItems[i].name == itemName) {
			this.cartItems.splice(i, 1);
			break;
		}
	}
}

ShoppingCart.prototype.render = function() {
	this.attache.html(this.renderer({"cartItems": this.cartItems}));
}

$(document).ready(function() {
	var shoppingCart = new ShoppingCart($("#cart-items"), Handlebars.templates["shoppingCart.hbs"]);
	$.post("/api/farmer/priceList", function(data) {
		console.log(data.prices);
		$("#items-display").append(Handlebars.templates["homeItems.hbs"]({"items": data.prices}));
		$("button.add-to-cart").click(function (event) {
			var itemName = event.target.id;
			itemName = itemName.substring(12, itemName.length);
			shoppingCart.addItem({
				"name": itemName,
				"weight": $("#item-" + itemName + " [name=\"weight\"]").val()
			});
			shoppingCart.render();
		});
		$("#shopping-cart").click(function (event) {
			if (event.target.className != "delete-button")
				return;
			var itemName = event.target.id;
			itemName = itemName.substring(14, itemName.length);
			shoppingCart.removeItem(itemName);
			shoppingCart.render();
		});
		$("button#final-purchase").click(function (event) {
			if (shoppingCart.cartItems.length > 0)
				$.ajax({
					type: 'post',
					url: "/api/farmer/order",
					data: JSON.stringify({ orderList: shoppingCart.cartItems }),
					contentType: 'application/json',
					dataType: 'json',
					complete: function (data) {
						location.href = location.href.replace("home.html", "transaction-done.html");
					}
				});
		});
	});
});