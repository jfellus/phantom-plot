// An easy-to-write plotter outputting SVG, using PhantomJS and D3

var system = require('system');
var fs = require('fs')
var page = require('webpage').create();

page.content = '<html><body></body></html>';
page.injectJs('./d3.v3.min.js');

page.onConsoleMessage = function(msg) {
  console.log(msg);
}

function phantom_plot(input) {
  return page.evaluate(function(input) {
    var body = d3.select('body');
    body.html("")
    var svg = body.append('svg');
    svg.append('text').text(input);
    svg.append('circle');
    var s = new XMLSerializer();
    return s.serializeToString(document.querySelector('svg'))
  }, input);
}

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
        out = phantom_plot(fs.read(f[0]));
        fs.write(f[1], out, "w")
      }
    } catch(e) { console.error(e)}
  }
}

else if(system.args.slice(1).join("")){
  console.log(phantom_plot(system.args.slice(1).join("")))
}

else {
  console.log(phantom_plot(system.stdin.read()))
}

phantom.exit();
