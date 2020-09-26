import datetime
import json

from firebase import firebase
import requests

from geopy.distance import great_circle

from flask import Flask, request, render_template, send_from_directory
app = Flask(__name__,template_folder="../frontend", static_url_path="")

firebase = firebase.FirebaseApplication('https://close-draw.firebaseio.com', None)

def search(client_lat, client_lon, max_distance):
  remove = firebase.get('/drawingInfo', None)
  for key, val in remove.items():
      print('DB TIME: ' + val["Time"])
      oldTime = datetime.datetime.strptime(val["Time"], "%a %b %d %H:%M:%S %Y")
      newTime = datetime.datetime.now()
      lapTime = newTime - oldTime
      if (lapTime.total_seconds() > (86400)):
          firebase.delete('/drawingInfo', key)

  drawings = firebase.get("/drawingInfo", None)
  good_drawings = []
  for key, val in drawings.items():
    val["_id"] = key # just to make it easier to send to Evan
    lat = val["Latitude"]
    lon = val["Longitude"]
    coordUser = (client_lat, client_lon)
    coordDB = (lat, lon)
    print(coordUser, coordDB)
    distance = great_circle(coordUser, coordDB)
    if distance.miles <= max_distance:
      val["Distance"] = int(distance.feet)
      good_drawings.append(val)

  return good_drawings


def upload(image_url, caption, lat, lon):
    uploadData = {
        'Longitude': lon,
        'Latitude': lat,
        'Time': datetime.datetime.now().strftime("%a %b %d %H:%M:%S %Y"),
        'Picture Location': image_url,
        'Caption': caption,
        'Likes': 0,
        'Dislikes': 0
    }
    uploadPush = firebase.post('/drawingInfo', uploadData)

def updateLike(id):
    checklike = firebase.get('/drawingInfo', id)
    currentLikes = checklike["Likes"]
    newLikes = int(currentLikes) + 1
    likePush = firebase.put('/drawingInfo'+'/'+id,'Likes', int(newLikes))

def updateDislike(id):
    checkdislike = firebase.get('/drawingInfo', id)
    currentDislike = checkdislike["Dislikes"]
    newDislikes = int(currentDislike) + 1
    likePush = firebase.put('/drawingInfo'+'/'+id,'Dislikes', int(newDislikes))

def getDrawing(id):
    drawingRequest = firebase.get('/drawingInfo', id)
    return drawingRequest

@app.route("/loodle/upload", methods=["POST"])
def _upload():
    data = request.json
    upload(data["url"], data["caption"], float(data["lat"]), float(data["lon"]))
    return json.dumps({"success": True})

@app.route("/loodle/search")
def _search():
    args = request.args
    return json.dumps(search(float(args["lat"]), float(args["lon"]), int(args["dist"])))

@app.route("/loodle/like")
def _like():
    args = request.args
    updateLike(args["id"])
    return json.dumps(getDrawing(args["id"]))

@app.route("/loodle/dislike")
def _dislike():
    args = request.args
    updateDislike(args["id"])
    return json.dumps(getDrawing(args["id"]))

@app.route("/loodle/")
def _index():
    return render_template("index.html")

@app.route("/loodle/draw")
def _draw():
    return render_template("draw.html")

@app.route('/loodle/js/<path:path>')
def send_js(path):
    return send_from_directory('../frontend/js', path)

@app.route('/loodle/css/<path:path>')
def send_css(path):
    return send_from_directory('../frontend/css', path)
