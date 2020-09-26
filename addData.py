from firebase import firebase

firebase = firebase.FirebaseApplication('https://close-draw.firebaseio.com', None)
data = {
    'Name':'Sam M',
    'SSN':'219',
    'Email':'poop'
}

result = firebase.post('/close-draw/Student', data)

print(result)