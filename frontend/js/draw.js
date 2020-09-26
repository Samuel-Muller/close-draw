/* draw.js - based on https://github.com/williammalone/Simple-HTML5-Drawing-App
 * Licensed under MIT
 */

var context = document.getElementById('canvas').getContext("2d");
var penColor = "black";
var penSize = 2;
var paint; 

var clickX = new Array();
var clickY = new Array();
var strokes = new Array();
var sizes = new Array();
var clickDrag = new Array();

// As it turns out, offsetTop is royally messed up by Material Lite
$('#canvas').mousedown(function(e) {
  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop - 64, penColor, penSize);
  redraw();
});
$('#canvas').mousemove(function(e) {
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop - 64, penColor, penSize, true);
    redraw();
  }
});
$('#canvas').mouseup(function(e) {
  paint = false;
});
$('#canvas').mouseleave(function(e) {
  paint = false;
});

$('.color-changer').click(function(e) {
  penColor = e.currentTarget.dataset.color;
});

$('.pen-width').change(function(e) {
  penSize = e.target.value;
});

function addClick(x, y, color, size, dragging) {
  clickX.push(x);
  clickY.push(y);
  strokes.push(color);
  sizes.push(size);
  clickDrag.push(dragging);
}

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.lineJoin = "round";
  for (var i = 0; i < clickX.length; i++) {		
    context.beginPath();
    context.strokeStyle = strokes[i];
    context.lineWidth = sizes[i];
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i-1], clickY[i-1]);
     } else {
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}