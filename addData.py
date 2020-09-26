import requests
import json
from firebase import firebase
from geopy.distance import great_circle




send_url = "http://api.ipstack.com/check?access_key=6a554c654da3f5d634ab99a2bedae475"
geo_req = requests.get(send_url)
geo_json = json.loads(geo_req.text)
latitude = geo_json['latitude']
longitude = geo_json['longitude']
city = geo_json['city']


firebase = firebase.FirebaseApplication('https://close-draw.firebaseio.com', None)
data = {
    'Longitude':longitude,
    'Latitude':latitude,
    'City':city,
    'Time':'WIP',
    'Picture Location':'PUTGOOGLECLOUDSPACE',
    'Caption':'HEREWITHMYGIRLS'
}

result = firebase.post('/close-draw/TestDB', data)

print(result)

coords_1 = (40.7428, -74.1771)
coords_2 = (latitude, longitude)

print(great_circle(coords_1, coords_2).miles)
