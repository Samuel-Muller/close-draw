import requests
import json
import firebase_admin
from firebase import firebase
from geopy.distance import great_circle
from firebase_admin import credentials
from firebase_admin import db
import time

t = time.localtime()
current_time = time.strftime("%H:%M:%S", t)
send_url = "http://api.ipstack.com/check?access_key=6a554c654da3f5d634ab99a2bedae475"
geo_req = requests.get(send_url)
geo_json = json.loads(geo_req.text)
latitude = geo_json['latitude']
longitude = geo_json['longitude']
city = geo_json['city']

# open database
firebase = firebase.FirebaseApplication('https://close-draw.firebaseio.com', None)



#what to add to each database
data = {
    'Longitude':longitude,
    'Latitude':latitude,
    'City':city,
    'Time':current_time,
    'Picture Location':'PUTGOOGLECLOUDSPACE',
    'Caption':'HEREWITHMYGIRLS',
    'Likes':'Count',
    'Dislikes':'Count',
    'Trophy':'Count'
}
#where to POST IT (CHANGE '/testUser' to something more better)
result = firebase.post('/testUser', data)
#this will print the ID KEY
print(result)
#function to pass and sort
def search(client_lat, client_lon, max_distance):
  drawings = firebase.get("/posts", None)
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
  return good_drawings





