// An easy-to-write plotter outputting SVG, using PhantomJS and D3


var system = require('system');
var fs = require('fs')
var page = require('webpage').create();
var process = require("child_process")


page.onConsoleMessage = function(msg) { console.log(msg); }
page.content = '<html><body><svg><defs>' +
'            <marker id="arrow" refX="4" refY="5" markerWidth="10" markerHeight="10" orient="auto">'+
'                <path d="M0,0 L10,5 L0,10 Z" class="arrow"></path>'+
'            </marker>'+
'            <marker id="square" refX="2.5" refY="2.5" markerWidth="5" markerHeight="5" orient="auto">'+
'                <path d="M0,0 L0,5 L5,5 L5,0 Z" class="square"></path>'+
'            </marker>'+
'        </defs>' +
'</svg></body></html>';

page.injectJs('./d3.v4.min.js');
page.injectJs('./d3.utils.js');
page.injectJs('./d3.legend.js');
page.injectJs('./plot.js');


var PATH = fs.workingDirectory;

function path_ext(f) { return f.substr(f.lastIndexOf('.') + 1) }
function path_change_ext(f, ext) { return f.substr(0, f.lastIndexOf('.')+1) + ext }



function phantom_plot(input) {
  return page.evaluate(function(input) { return plot(input) }, input);
  system.stdout.flush();
}

ASYNC=false;
function svg2pdf(i, o, cb) {
  ASYNC=true;
  process.execFile("svg2pdf", [i, o], null, function(err, stdout, stderr){
    ASYNC=false;
    cb()
  })
}

/** parse input.source */
function parse_source(source) {
  input = {
    headers:[],
    styles:[],
    data:[],
    datafiles:[],
    colors:["black", "red", "green", "blue", "#d7191c", "#fdae61", "#ffffbf","#abd9e9", "#2c7bb6"],
    stroke_widths:["1px"],
    markers:[ "none" ],
    source:source.trim()
  }
  input.source.split("\n").forEach(function(line) { parse_statement(line) })
  // console.log(JSON.stringify(input))
}

DATA_COL_SEPARATOR = new RegExp('[ ,:;|]')
function add_data_cols(x, fn) {
  var x = x.split("\n").map(function(s){return s.trim()}).filter(function(s){return !!s;});
  var h = x[0].split(DATA_COL_SEPARATOR)
  var hasHeader = !(new RegExp('^[0-9.]$').test(h[0]))
  var hasX = h.length>1

  if(hasHeader) {
    if(hasX) { input.xlabel = input.xlabel || h[0]; h.shift(); }
    h.forEach(function(name) { input.headers.push(name)})
    x.shift()
  } else {
    fn = fn.substr(0, fn.lastIndexOf("."))
    if(!hasX) input.headers.push(fn)
    else h.forEach(function(name, i) { input.headers.push(fn + "_" + i)})
  }

  data = x.map(function(r) {
    return r.split(DATA_COL_SEPARATOR).map(function(x) { return parseFloat(x); })
  })

  input.data.push(data)
}

/** parse a single statement, populating the 'input' global */
function parse_statement(line) {
  s = line.split(/[ \t=,]/);
  inst = s[0].toUpperCase()
  s.shift()
  if(inst === "DATA") {
    s.forEach(function(f) {
      input.datafiles.push(f)
      add_data_cols(fs.read(f), f)
    })
  } else if(inst === "HEADERS" || inst === "HEADER") {
    input.headers = s
  } else if(inst === "SIZE") {
    input.size = {w:parseInt(s[0]), h:parseInt(s[1])}
  } else if(inst === "MARGIN") {
    input.margin = {left:parseInt(s[0]), top:parseInt(s[1]), right:parseInt(s[2]), bottom:parseInt(s[3])}
  } else if(inst === "NOMARKERS") input.markers = null
  else if(inst === "XRANGE") input.xrange = s
  else if(inst === "YRANGE") input.yrange = s
  else if(inst === "MARKERS") input.markers = s
  else if(inst === "XLABEL") input.xlabel = s.join(" ")
  else if(inst === "YLABEL") input.ylabel = s.join(" ")
  return true
}

/** @return true if input refers to files newer than 'date' */
function check_newer_datafiles(date) {
  return input.datafiles.every(function(f) {
    if(!fs.exists(f)) return true
    if(fs.lastModified(f) > date) return false
  })
}

function path_filename(f) {
  return f.substr(f.lastIndexOf("/")+1)
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
    "    phantom-plot <infile> <outfile> : Process statements in\n"+
    "        infile and output SVG to outfile\n" +
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
      if(line==="exit") break;

      f = line.split(" ")
      if(f[0] && f[1]) {
        parse_source(fs.read(f[0]));
        cache_source = path_change_ext(f[0],"pp-cache");
        cache_svg = path_change_ext(cache_source, "svg")
        cache_pdf = path_change_ext(cache_source, "pdf")

        if(fs.exists(cache_source)) system.stderr.write("cache found");
        system.stderr.write("---cache\n" + fs.read(cache_source).trim() + "\n---source\n" + input.source)
        if(check_newer_datafiles(fs.lastModified(cache_source)) ) system.stderr.write("NEWER !");
                if(fs.exists(cache_source) && fs.read(cache_source) === input.source && !check_newer_datafiles(fs.lastModified(cache_source))) {
          system.stderr.write("USE CACHE")
          // Use cache if not modified
          fs.write(fSvg, fs.read(cache_svg), "w")
          if(path_ext(f[1]) === 'pdf') {
            try {
              fs.write(f[1], fs.read(cache_pdf), "w")
            } catch(e) {
              // Eventually build pdf if not exists
              svg2pdf(fSvg, f[1], function() {
                  fs.write(cache_pdf, fs.read(f[1]), "w")
                  system.stdout.write("ok\n")
              });
            }
          }
        } else {
          console.error("CACHEMISS")
          // Render if cache miss
          out = phantom_plot(input);
          fSvg = path_change_ext(f[1], "svg");
          fs.write(fSvg, out, "w");
          fs.write(cache_svg, out, "w");

          if(path_ext(f[1]) === 'pdf') {
            svg2pdf(fSvg, f[1], function() {
                fs.write(cache_pdf, fs.read(f[1]), "w")
                system.stdout.write("ok\n")
             });
          }

        }

        fs.write(cache_source, input.source, "w");

        if(!ASYNC) system.stdout.write("ok\n")
      }
    } catch(e) {
      system.stderr.write(e)
      system.stdout.write("ko\n")
    }
  }
}

else if(system.args.slice(1).length==2) {
  parse_source(fs.read(system.args[1]))
  if(path_ext(system.args[2]) === 'pdf') {
    var fSvg = path_change_ext(system.args[2], "svg");
    fs.write(fSvg, phantom_plot(input), "w")
    svg2pdf(fSvg, system.args[2]);
  } else {
    fs.write(system.args[2], phantom_plot(input), "w")
  }
}

else {
  parse_source(system.stdin.read())
  console.log(phantom_plot(input))
}

phantom.exit();
