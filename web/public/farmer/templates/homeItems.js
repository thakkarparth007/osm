(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['homeItems.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "		<div id=\"item-"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "\" class=\"item-purchase col l4 m6 s12\">\n			<img src=\"images/"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + ".jpg\" class=\"circle\"/>\n			<p class=\"item-purchase-name\">"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "</p>\n			<p>Rate: "
    + alias2(alias1((depth0 != null ? depth0.price : depth0), depth0))
    + "/kg</p><br />\n			<div class=\"input-field\">\n				<input name=\"weight\" type=\"text\"/>\n				<label for=\"weight\">Amount in kg</label>\n			</div><br />\n			<button id=\"add-to-cart-"
    + alias2(alias1((depth0 != null ? depth0.name : depth0), depth0))
    + "\" class=\"add-to-cart waves-effect btn red\">Add to bay<i class=\"material-icons right\">shopping_cart</i></button>\n		</div>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.items : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true});
})();