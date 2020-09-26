/* draw.js - based on https://github.com/williammalone/Simple-HTML5-Drawing-App
 * Licensed under MIT
 */

var context = document.getElementById('canvas').getContext("2d");
var penColor = "black";
var penSize = $('.pen-width').val();
var paint; 

var brushStrokes = [];
var strokeStarts = [];

// As it turns out, offsetTop is royally messed up by Material Lite
$('#canvas').mousedown(function(e) {
  strokeStarts.push(brushStrokes.length - 1);
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
  $('button').removeClass("selected");
  $(this).addClass("selected");
});

$('.undo').click(function(e) {
  undo();
});


$('.pen-width').change(function(e) {
  penSize = e.target.value;
});

function addClick(x, y, color, size, dragging) {
  brushStrokes.push({
    x: x,
    y: y,
    color: color,
    size: size,
    dragging: dragging || false
  });
}

function clear() {
  brushStrokes = [];
  redraw();
}

function undo() {
  lastStart = strokeStarts.pop()
  if (!lastStart) {
    return;
  }
  while (brushStrokes.length - lastStart > 1) {
    brushStrokes.pop();
  }
  redraw();
}

function redraw() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  context.lineJoin = "round";
  for (var i = 0; i < brushStrokes.length; i++) {		
    context.beginPath();
    context.strokeStyle = brushStrokes[i].color;
    context.lineWidth = brushStrokes[i].size;
    if (brushStrokes[i].dragging && i) {
      context.moveTo(brushStrokes[i-1].x, brushStrokes[i-1].y);
    } else {
      context.moveTo(brushStrokes[i].x-1, brushStrokes[i].y);
    }
    context.lineTo(brushStrokes[i].x, brushStrokes[i].y);
    context.closePath();
    context.stroke();
  }
}

var clearDialog = document.querySelector('#clear-dialog');
var sendDialog = document.querySelector('#send-dialog');
var clearDialogButton = document.querySelector('#clear');
var sendDialogButton = document.querySelector('#send');

if (!clearDialog.showModal) {
  dialogPolyfill.registerDialog(clearDialog);
}
if (!sendDialog.showModal) {
  dialogPolyfill.registerDialog(sendDialog);
}

clearDialogButton.addEventListener('click', function() {
  clearDialog.showModal();
});
clearDialog.querySelector('.close').addEventListener('click', function() {
  clearDialog.close();
});
clearDialog.querySelector('.confirm').addEventListener('click', function() {
  clear();
  clearDialog.close();
});

sendDialogButton.addEventListener('click', function() {
  sendDialog.showModal();
});
sendDialog.querySelector('.close').addEventListener('click', function() {
  sendDialog.close();
});
sendDialog.querySelector('.confirm').addEventListener('click', function() {
  //clear();
  
  sendDialog.close();
});