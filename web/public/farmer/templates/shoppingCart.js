(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['shoppingCart.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "	<div class=\"cart-item row\">\n		<div class=\"cart-item-details col s9\">\n			<p class=\"big\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + " <span id=\"delete-button-"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "\" class=\"delete-button\">&times;</span></p>\n			<p class=\"small\">"
    + alias2(alias1((depth0 != null ? depth0.weight : depth0), depth0))
    + " kg</p>\n		</div>\n		<div class=\"col s3\">\n		</div>\n	</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.cartItems : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();