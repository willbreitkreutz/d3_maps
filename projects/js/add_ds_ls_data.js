d3.csv("../../data/csv/ds_ls_top_ten.csv", parse_ds_ls_top_ten, function(error, features) {
  svg.append("path")
    .datum({type:"FeatureCollection", features: features})
    .attr("d",path)
    .attr("class","top-ten");;
});

function parse_ds_ls_top_ten(d) {
  if(d.levee_par > 0){
    return {
      type: "Feature",
      properties: {
        name: d.location,
        levee_econ:d.levee_econ,
        levee_par:d.levee_par,
        levee_life_safety:d.levee_life_safety,
        dam_econ:d.dam_econ,
        dam_par:d.dam_par,
        dam_life_safety:d.dam_life_safety,
        combined_econ:d.combined_econ,
        combined_par:d.combined_par,
        combined_life_safety:d.combined_life_safety
      },
      geometry: {
        type: "Point",
        coordinates: [+d.lon, +d.lat]
      }
    };
  };
}
