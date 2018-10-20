
d3.selection.prototype.legend = function(props) {
  if(!props) props = {}
  var margin = props.margin || {left:20, top:30, right:20, bottom:30};
  var position = props.position || "top-left";
  var legend = [];

  this.selectAll("[data-legend]").each(function() {
    legend.push({
      name:this.getAttribute("data-legend"),
      color:this.style.stroke,
      marker:this.style.markerMid,
      strokeWidth:this.style.strokeWidth
    })
  })

  var gLegend = this.append("g").translate(margin.left, margin.top);
  var g = gLegend.selectAll("g").data(legend).enter().append("g")
    .attr("transform", function(d,i) { return "translate(0,"+(i*14)+")" } );

  g.append("text")
    .style("font-size", "13px")
    .attr("x", 27)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "baseline")
    .text(function(d) {return d.name;});

  g.append("path").attr("d", "M3 -3 h 10 h 10")
    .style("stroke", function(d) { return d.color})
    .style("marker", function(d) { return d.marker})
    .style("stroke-width", function(d) { return d.strokeWidth })

    gLegend.insert("rect", ":first-child")
      .style("fill", "white")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .bbox(gLegend, -3)
    gLegend.insert("rect", ":first-child")
      .style("fill", "#dedede")
      .style("stroke", "none")
      .bbox(gLegend).translate(3,3)


  if(position === "top-right") gLegend.translate(this.width()-gLegend.width()-margin.right, margin.top)
  else if(position === "bottom-left") gLegend.translate(margin.left, this.height()-gLegend.height()-margin.bottom)
  else if(position === "bottom-right") gLegend.translate(this.width()-gLegend.width()-margin.right, this.height()-gLegend.height()-margin.bottom)
}
