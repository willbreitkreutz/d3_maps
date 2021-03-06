	
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
		
	menu.property("value",cleanText("levee_econ"));
	
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

var conflict = [];
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
	
	conflict = [];
	
	circles.enter().append("circle")
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("r",function(d){
				return radius(d.properties[list1],list1);
		});
		
	labels.enter().append("text")
		.attr("class","label")
		.attr("x",function(d){return path.centroid(d)[0]; })
		.attr("y",function(d){return path.centroid(d)[1]+radius(d.properties[list1],list1)+10; })
		.text(function(d){return d.properties.name + " " + formatNumber(d.properties[list1])});
		
	circles.transition()
		.duration(duration)
		.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		.attr("r",function(d){
			return radius(d.properties[list1],list1);
		});
		
	labels.transition()
		.attr("class","label")
		.attr("x",function(d){return path.centroid(d)[0]; })
		.attr("y",function(d){return path.centroid(d)[1]+radius(d.properties[list1],list1)+10; })
		//.attr("y",function(d){
		//	var newy = path.centroid(d)[1]+radius(d.properties[list1],list1)+10; 
		//	
		//	var checkConflict = function(v){
		//		var ret = v;
		//		for(var i=0;i<conflict.length;i++){
		//			var delta = conflict[i]-ret;
		//			if(delta < 10){
		//				var q = 
		//				ret = checkConflict(ret-15);
		//			}
		//		}
		//		return ret;
		//	}
		//	var newy1 = checkConflict(newy);
		//	if(newy1 !== undefined){conflict.push(newy1)};
		//	return newy1
		//})
		.text(function(d){return d.properties.name + " " + formatNumber(d.properties[list1])});
	
	d3.selectAll(".legend").remove();
	var legend = svg.append("g")
		.attr("class", "legend")
		.attr("transform", "translate(" + (width - 100) + "," + (height - 100) + ")")
	  .selectAll("g")
		.data([(domMax[list1]/4),(domMax[list1]/2),domMax[list1]])
	  .enter().append("g");

	legend.append("circle")
		.attr("cy", function(d) { return -radius(d,list1); })
		.attr("r", function(d){ return radius(d,list1)});

	legend.append("text")
		.attr("y", function(d) { return -2 * radius(d,list1); })
		.attr("dy", "1.3em")
		.text(d3.format(".1s"));
		
	arrangeLabels();
}

function arrangeLabels() {
  var move = 1;
  while(move > 0) {
    move = 0;
    svg.selectAll(".label")
       .each(function() {
         var that = this,
             a = this.getBoundingClientRect();
         svg.selectAll(".label")
            .each(function() {
              if(this != that) {
                var b = this.getBoundingClientRect();
                if((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
                   (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
                  // overlap, move labels
                  var dx = (Math.max(0, a.right - b.left) +
                           Math.min(0, a.left - b.right)) * 0.01,
                      dy = (Math.max(0, a.bottom - b.top) +
                           Math.min(0, a.top - b.bottom)) * 0.02,
                      tt = d3.transform(d3.select(this).attr("transform")),
                      to = d3.transform(d3.select(that).attr("transform"));
                  move += Math.abs(dx) + Math.abs(dy);
                
                  to.translate = [ to.translate[0] + dx, to.translate[1] + dy ];
                  tt.translate = [ tt.translate[0] - dx, tt.translate[1] - dy ];
                  d3.select(this).attr("transform", "translate(" + tt.translate + ")");
                  d3.select(that).attr("transform", "translate(" + to.translate + ")");
                  a = this.getBoundingClientRect();
                }
              }
            });
       });
  }
}
