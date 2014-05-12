var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight);
	
var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([width / 2, height / 2]);
	
var path = d3.geo.path()
	.projection(projection);
	
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
	
d3.json("../../data/topoJson/us.json", function(error, us){
	
	var counties = topojson.feature(us, us.objects.counties).features;
	
	var states = topojson.feature(us, us.objects.states).features;

	svg.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("d", path)
      .attr("class", "land-boundary");

	svg.append("path")
		.datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
		.attr("d", path)
		.attr("class", "county-boundary");
		
	svg.append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a,b){return a !== b;}))
		.attr("d",path)
		.attr("class","state-boundary");
		
});