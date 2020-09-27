/* draw.js - based on https://github.com/williammalone/Simple-HTML5-Drawing-App
 * Licensed under MIT
 */

var firebaseConfig = {
  apiKey: "AIzaSyCCm8uJxxDWemcC8FDG_x3ZX6EgOrmyk2g",
  authDomain: "close-draw.firebaseapp.com",
  databaseURL: "https://close-draw.firebaseio.com",
  projectId: "close-draw",
  storageBucket: "close-draw.appspot.com",
  messagingSenderId: "1021757931194",
  appId: "1:1021757931194:web:16254c5da128139f66cc83",
  measurementId: "G-JY2FYVSB2R"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var storage = firebase.storage();

var canvas = document.getElementById('canvas');
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
  submit();
  sendDialog.close();
});

function submit() {
  function locSuccess(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    var url = new URL("https://evanjmarkowitz.com/loodle/upload")
    var caption = $("#caption").val();
    var drawing = canvas.toDataURL();
    var timestamp = Number(new Date());
    var storageRef = firebase.storage().ref(timestamp.toString());

    storageRef.putString(drawing, 'data_url').then(function(snapshot) {
      snapshot.ref.getDownloadURL().then(function(download) {
        const data = { url: download, caption: caption, lat: latitude, lon: longitude };

        fetch('https://evanjmarkowitz.com/loodle/upload', {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
           console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error)
        });
      });
    });

    url.search = new URLSearchParams(params).toString();
    fetch(url)
    .then(response => response.json())
    .then(data => {
      for (let drawing of data) {
        elem = drawingToCard(drawing);
        document.getElementById("drawings").append(elem);
      }
    });
  }
  function locError() {
    /* pass */
  }
  if (!navigator.geolocation) {
    /* shh */
  } else {
    navigator.geolocation.getCurrentPosition(locSuccess, locError);
  }
}
