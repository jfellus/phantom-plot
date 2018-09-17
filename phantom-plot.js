// An easy-to-write plotter outputting SVG, using PhantomJS and D3

var system = require('system');
var fs = require('fs')
var page = require('webpage').create();

page.onConsoleMessage = function(msg) { console.log(msg); }
page.content = '<html><body></body></html>';
page.injectJs('./d3.v4.min.js');

var PATH = fs.workingDirectory;

function phantom_plot(input) {
  return page.evaluate(function(input) {
    var data = input.data;
    var margin = input.margin || {top: 20, right: 20, bottom: 30, left: 50}
    var size = input.size || {w:960, h:500}

    width = size.w - margin.left - margin.right
    height = size.h - margin.top - margin.bottom

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

    if(input.css) svg.append("style").text("\n" + input.css + "\n")

    svg = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d[0]; }));
    y.domain([0, d3.max(data, function(d) { return d[1]; })]);

    // Curves
    function plot(data, colx, coly) {
      colx = colx || 0
      coly = coly || 1
      var valueline = d3.line()
      .x(function(d) { return x(d[colx]); })
      .y(function(d) { return y(d[coly]); });

      svg.append("path")
      .data([data])
      .style("fill", "none")
      .style("stroke", "green")
      .style("stroke-width", "5px")
      .attr("d", valueline);
    }

    for(var i=1; i<data[0].length; i++) {
      plot(data, 0, i);
    }

    // Axes
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    svg.append("g")
    .call(d3.axisLeft(y));


    return new XMLSerializer().serializeToString(document.querySelector('svg'))
  }, input);
}

var input = {};
input.csv = fs.read("./test/data.csv")
input.data = input.csv.split("\n").filter(function(x){ return x.indexOf(",") !== -1;}).map(function(x) { return x.split(",").map(function(x) { return parseFloat(x); })});
input.data.shift()

if(system.args[1] === '-h') {
  console.log(
    " phantom-plot : an easy-to-write plotter that outputs SVG using D3 and PhantomJS\n"    +
    " --------\n" +
    " USAGE\n" +
    " --------\n" +
    "    phantom-plot -h : Display this help\n" +
    "\n" +
    "    phantom-plot: Wait for input statements and\n" +
    "        output SVG to stdout\n"+
    "\n" +
    "    phantom-plot <inline-statements> : Process the\n"+
    "        inline-statements and output SVG to stdout\n" +
    "\n" +
    "    phantom-plot --multiple-files : Each input line\n"+
    "        must be \"infile outfile\". For each line, \n" +
    "        process the infile and write SVG to corresponding outfile\n"
  )

}


else if(system.args[1] === "--multiple-files") {
  while(!system.stdin.atEnd()) {
    try {
      var line = system.stdin.readLine();
      f = line.split(" ")
      if(f[0] && f[1]) {
        input.x = fs.read(f[0]);
        out = phantom_plot(input);
        fs.write(f[1], out, "w")
      }
    } catch(e) { console.error(e)}
  }
}

else if(system.args.slice(1).join("")){
  input.x = system.args.slice(1).join("")
  console.log(phantom_plot(input))
}

else {
  input.x = system.stdin.read()
  console.log(phantom_plot(input))
}

phantom.exit();
