import requests
import json
import firebase_admin
from firebase import firebase
from geopy.distance import great_circle
from firebase_admin import credentials
from firebase_admin import db
import datetime

t = datetime.datetime.now()
t = t.strftime("%a %b %d %H:%M:%S %Y")
send_url = "http://api.ipstack.com/check?access_key=6a554c654da3f5d634ab99a2bedae475"
geo_req = requests.get(send_url)
geo_json = json.loads(geo_req.text)
latitude = geo_json['latitude']
longitude = geo_json['longitude']
city = geo_json['city']

# open database
firebase = firebase.FirebaseApplication('https://close-draw.firebaseio.com', None)

#TODO: Check if time is more than 24 hours


#what to add to each database
data = {
    'Longitude':longitude,
    'Latitude':latitude,
    'Time':t,
    'Picture Location':'PUTGOOGLECLOUDSPACE',
    'Caption':'HEREWITHMYGIRLS',
    'Likes':'Count',
    'Dislikes':0
}
#where to POST IT (CHANGE '/testUser' to something more better)
#result = firebase.post('/testUser', data)
#this will print the ID KEY
""""
#function to pass and sort
remove = firebase.get('/testUser', None)
for key, val in remove.items():
    print('DB TIME: ' + val["Time"])
    oldTime = datetime.datetime.strptime(val["Time"], "%a %b %d %H:%M:%S %Y")
    newTime = datetime.datetime.now()
    lapTime = newTime - oldTime
    if(lapTime.total_seconds()>(86400)):
        firebase.delete('/testUser', key)
        print("Deleted database" + key)
"""
#    oldTime = datetime.datetime.strptime(val['Time'],"%m/%d%Y, %H:%M:%S")

def search(client_lat, client_lon, max_distance):

  drawings = firebase.get("/drawingInfo", None)
  good_drawings = []
  for key, val in drawings.items():
    val["_id"] = key # just to make it easier to send to Evan
    lat = val["Latitude"]
    lon = val["Longitude"]
    coordUser = (client_lat, client_lon)
    coordDB = (lat, lon)
    distance = great_circle(coordUser, coordDB)
    if distance <= max_distance:
      good_drawings.append(val)
 ## Above will return a good drawing
  ##BELOW WILL REMOVE ALL PAST 24 HOUR DRAWING
  remove = firebase.get('/drawingInfo', None)
  for key, val in remove.items():
      print('DB TIME: ' + val["Time"])
      oldTime = datetime.datetime.strptime(val["Time"], "%a %b %d %H:%M:%S %Y")
      newTime = datetime.datetime.now()
      lapTime = newTime - oldTime
      if (lapTime.total_seconds() > (86400)):
          firebase.delete('/drawingInfo', key)
          print("Deleted database" + key)

  ##ONCE FINISHED IT WILL RETURN GOOD PHOTOS within distance
  return good_drawings


def upload(image_url, caption, lat, lon):
    uploadData = {
    'Longitude':lat,
    'Latitude':lon,
    'Time':t,
    'Picture Location':image_url,
    'Caption':caption,
    'Likes':0,
    'Dislikes':0

    }
    uploadPush = firebase.post('/drawingInfo', uploadData)

def updateLike(id):
    checklike = firebase.get('/drawingInfo', id)
    currentLikes = checklike["Likes"]
    newLikes = int(currentLikes) + 1
    #print(str(newLikes) + 'LIKES UPDATE')

    likePush = firebase.put('/drawingInfo'+'/'+id,'Likes', int(newLikes))

    #print ('Likes pushed')

def updateDislike(id):
    checkdislike = firebase.get('/drawingInfo', id)
    currentDislike = checkdislike["Dislikes"]
    newDislikes = int(currentDislike) + 1
    #print(str(newDislikes) + 'DISLIKES UPDATE')

    likePush = firebase.put('/drawingInfo'+'/'+id,'Dislikes', int(newDislikes))

    #print ('Likes pushed')

def getDrawing(id):
    drawingRequest = firebase.get('/drawingInfo', id)
    print(str(drawingRequest))


updateDislike('-MIA8U2CnkbOsXaajI10')