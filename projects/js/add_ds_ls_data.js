	
var formatNumber = d3.format(",.2f");

var duration = 500;

var locations;
var domMax = {};

var menu = d3.select("#menu select").on("change",change);

var dataArea = svg.append("g")
	.attr("class","top-ten");
	
var cleanText = function(t){
	t = '_'+t;
	var a = t.split('');
	var ret = '';
	for(var i=0;i<a.length;i++){
		if(a[i]==='_'){
			ret = ret + ' ' + a[i+1].toUpperCase();
			i++;
		}else{
			ret = ret + a[i];
		}
	}
	return ret.trim();
}

var dirtyText = function(t){
	t = t.toLowerCase();
	return t.replace(/ /g,'_');
}

d3.csv("../../data/csv/ds_ls_top_ten.csv", parse_ds_ls_top_ten, function(error, features) {
	locations = features;
	
	var lists = d3.keys(locations[0].properties).filter(function(key){
		return key !== "name";
	});
	
	var tmpArray = [];
	for(var i=0;i<lists.length;i++){
		tmpArray = [];
		for(var y=0;y<locations.length;y++){
			tmpArray.push(locations[y].properties[lists[i]]);
		}
		domMax[lists[i]] = d3.max(tmpArray);
	}
	
	menu.selectAll("option")
		.data(lists)
	  .enter().append("option")
		.text(function(d){return cleanText(d);});
		
	menu.property("value","levee_econ");
	
	redraw();
});

function parse_ds_ls_top_ten(d) {
    return {
      type: "Feature",
      properties: {
        name: d.location,
        levee_econ:parseFloat(d.levee_econ),
        levee_par:parseFloat(d.levee_par),
        levee_life_safety:parseFloat(d.levee_life_safety),
        dam_econ:parseFloat(d.dam_econ),
        dam_par:parseFloat(d.dam_par),
        dam_life_safety:parseFloat(d.dam_life_safety),
        combined_econ:parseFloat(d.combined_econ),
        combined_par:parseFloat(d.combined_par),
        combined_life_safety:parseFloat(d.combined_life_safety)
      },
      geometry: {
        type: "Point",
        coordinates: [+d.lon, +d.lat]
      }
    };
}

var radius = function(d,index){
	var n = d3.scale.sqrt()
		.domain([.000001, domMax[index]])
		.range([4, 40]);
	return n(d);
}

function change(){
	redraw();
}

var redraw = function(){
	var list1 = dirtyText(menu.property("value"));
	var topTen = locations.sort(function(a,b){return b.properties[list1]-a.properties[list1];}).slice(0,10);

	var circleLayer = svg.selectAll(".top-ten");
	
	var circles = circleLayer.selectAll("circle")
		.data(topTen);
		
	var labels = circleLayer.selectAll("text")
		.data(topTen);
		
	circles.exit().remove();
	
	labels.exit().remove();
	
	circles.enter().append("circle")
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("r",function(d){
				return radius(d.properties[list1],list1);
		});
		
	labels.enter().append("text")
		.attr("class","label")
		.attr("x",function(d){return path.centroid(d)[0]; })
		.attr("y",function(d){return path.centroid(d)[1]; })
		.attr("text-anchor", "center")
		.text(function(d){return d.properties.name + "\n" + cleanText(list1) + ' ' + formatNumber(d.properties[list1])});
		
	circles.transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("r",function(d){
			return radius(d.properties[list1],list1);
		});
		
	labels.transition()
		.attr("class","label")
		.attr("x",function(d){return path.centroid(d)[0]; })
		.attr("y",function(d){return path.centroid(d)[1]; })
		.attr("text-anchor", "center")
		.text(function(d){return d.properties.name + "\n" + cleanText(list1) + ' ' + formatNumber(d.properties[list1])});
}
