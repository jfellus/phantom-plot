function plot(input) {

  /** if colx==-1 consider x=[0,n], otherwise plot(x,y) */
  function plot_xy(data, colx, coly, index) {
    coly = coly || 0
    var valueline = d3.line()
    .x(function(d,i) { return colx===-1 ? x(i) : x(d[colx]); })
    .y(function(d) { return y(d[coly]); });

    fig.append("path")
    .data([data])
    .style("fill", "none")
    .style("marker-start", marker(index))
    .style("marker-end", marker(index))
    .style("marker-mid", marker(index))
    .style("stroke", color(index))
    .style("stroke-width", stroke_width(index))
    .attr("data-legend",function(d) { return input.headers[index] || ""})
    .attr("d", valueline);
  }

  function color(i) { return input.colors[i%input.colors.length];}
  function stroke_width(i) { return input.stroke_widths[i%input.stroke_widths.length];}
  function marker(i) {
    if(!input.markers || !input.markers.length) return null;
    return "url(#"+input.markers[i%input.markers.length]+")";
  }



var margin = input.margin || {top: 20, right: 20, bottom: 50, left: 50}
var size = input.size || {w:500, h:400}

width = size.w - margin.left - margin.right
height = size.h - margin.top - margin.bottom

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var svg = d3.select("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.style("font-family", "sans-serif");

if(input.css) svg.append("style").text("\n" + input.css + "\n")

svg.append("svg:clipPath").attr("id", "cliparea").append("rect").bbox({x:0,y:0,width:width,height:height})
svg = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var fig = svg.append("g").style("clip-path", "url(#cliparea)")

function minX() { return d3.min(input.data, function(data) {return d3.min(data, function(row, i) { return row.length===1 ? i : row[0]})}) }
function maxX() { return d3.max(input.data, function(data) {return d3.max(data, function(row, i) { return row.length===1 ? i : row[0]})}) }
function minY() { return d3.min(input.data, function(data) {return d3.min(data, function(row, i) { return row.length===1 ? row[0] : d3.min(row.slice(1))})}) }
function maxY() { return d3.max(input.data, function(data) {return d3.max(data, function(row, i) { return row.length===1 ? row[0] : d3.max(row.slice(1))})}) }

x.domain(input.xrange || [minX(),maxX()]);
y.domain(input.yrange || [minY(),maxY()]);


var index = 0;
input.data.forEach(function(d) {
  d[0].forEach(function(col, i) {
    if(i==0 && d[0].length>1) return;
    plot_xy(d, d[0].length===1 ? -1 : 0, i, index) // no x axis -> [0,n]
    index++;
  })
})

// Axes
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

svg.append("g")
  .call(d3.axisLeft(y));

// Axes labels

// text label for the y axis
if(input.ylabel)
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "20")
    .style("text-anchor", "middle")
    .text(input.ylabel);

if(input.xlabel)
svg.append("text")
    .attr("y", height)
    .attr("x", width / 2)
    .attr("dy", "35")
    .style("text-anchor", "middle")
    .text(input.xlabel);

svg.append("rect").bbox({x:0,y:0,width:width,height:height})
  .style("stroke", "black")
  .style("fill", "none")


// Legend
svg.legend(input.legend)


return new XMLSerializer().serializeToString(document.querySelector('svg'))

}
