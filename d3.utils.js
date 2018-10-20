
d3.selection.prototype.bbox = function(v, margin) {
  margin = margin || 0
  if(!v) return (this.node ? this.node() : this).getBBox();
  if(typeof v.node === 'function') return this.bbox(v.node().getBBox(), margin)
  if(typeof this.attr === "function") {
    this.attr("x", v.x + margin);
    this.attr("y", v.y + margin);
    this.attr("width", v.width - margin - margin);
    this.attr("height", v.height - margin - margin);
  } else if(typeof this.setAttribute === 'function') {
    this.setAttribute("x", v.x + margin)
    this.setAttribute("y", v.x + margin)
    this.setAttribute("width", v.width - margin - margin)
    this.setAttribute("height", v.height- margin - margin)
  } else throw "Unknown type"
  return this
}

d3.selection.prototype.width = function() {
  return this.bbox().width;
}

d3.selection.prototype.height = function() {
  return this.bbox().height;
}

d3.selection.prototype.translate = function(x,y) {
  this.attr("transform", "translate("+x+","+y+")")
  return this
}
