d3.csv("../../data/csv/state-capitals.csv", type, function(error, capitals) {
  svg.append("path")
    .datum({type:"FeatureCollection", features: capitals})
    .attr("d",path)
    .attr("class","state-capital");;
});

function type(d) {
  return {
    type: "Feature",
    properties: {
      name: d.description,
      state: d.name
    },
    geometry: {
      type: "Point",
      coordinates: [+d.longitude, +d.latitude]
    }
  };
}
