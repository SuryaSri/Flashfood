import bottle
import json
import googlemaps
from bottle import get, post, request, run, install, response  # or route
from gevent import monkey; monkey.patch_all()
from redis import Redis as red
from pottery import RedisDict as redDict
from pottery import RedisSet as redSet
from pottery import RedisList as redList
from pottery import NextId

#Enable Cors to send/recieve data.
class EnableCors(object):
    name = 'enable_cors'
    api = 2
    def apply(self, fn, context):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'
            if bottle.request.method != 'OPTIONS':
                # actual request; reply with the actual response
                return fn(*args, **kwargs)
        return _enable_cors


#connection with redis-py client
dir_con = red(host = '0.0.0.0',port = 6379,db = 0)
#connection with pottery client
pot_con = red.from_url('http://localhost:6379/')

rest_ids = NextId(key='rest-ids', masters={pot_con})

#string encode with b prefix
def bytify(strung):
	return bytes(strung, encoding = "ascii")

def byte2string(strung):
	return strung.decode('utf-8')

def byte2int(strung):
	return int(byte2string(strung))

def byte2float(strung):
	return float(byte2string(strung))

def get_geocode(lat,longi):
    gmaps = googlemaps.Client(key='AIzaSyCGIi0Ts6EavD1FN4Ckx0uR7Ikr1Z1Jwgw')
    reverse_geocode_result = gmaps.reverse_geocode((lat,longi))
    #print('test')
    print(reverse_geocode_result[0]['formatted_address'])
    return reverse_geocode_result[0]['formatted_address']

'''
User: pottery dictionary
-name
-userId(primaryKey facebook generated)
-phone no
-lat
-long
-decoded_address
-
-int subscribed
'''

@post('/addUser')  #post request to add the user details.
def addUser():
    body = request.json
    key = "user:" + str(body['ID']) + ":details"
    body.pop('ID')
    user = redDict(redis = pot_con, key = key)
    for key in body:
        user[key] = body[key]
    if('subscribed' in user):
        body['subscribed'] = user['subscribed']
    if('decoded_address' not in user):
        if('lat' and 'long' in user):
            s = str(get_geocode(int(user['lat']),int(user['long'])))
            user['decoded_address'] = s
            #print(5,user['decoded_address'])
            body['decoded_address'] = user['decoded_address']
            body['location'] = 1
        else:
            body['location'] = 0
    print(json.dumps(body))
    yield json.dumps(body)
#d = {'id':23,"name":"nihal"}
#addUser(d)

@post('/Saddress')
def Saddress():
    body = request.json
    key = "user:" + str(body['ID']) + ":details"
    user['decoded_address'] = body['Saddress']
    print(user['decoded_address'])
    yield json.dumps(body)

@get('/getUser/<UserId>')
def getUser(UserId):
    key = "user:" + UserId + ":details"
    user = redDict(redis = pot_con, key = key)
    #print (user)
    data = {}
    if(len(user)!=0):
        data['name'] = user['name']
        if('subscribed' not in user):
            data['subscribed'] = 0
            data['location'] = 0
        else:
            data['subscribed'] = user['subscribed']
            if('decoded_address' and 'lat' and 'long' in user):
                data['decoded_address'] = user['decoded_address']
                data['location'] = 1
            else:
                data['location'] = 0
    else:
        data['name'] = ''
        data['subscribed'] = 0
        data['location'] = 0
    print(json.dumps(data))
    yield json.dumps(data)

@post('/deleteUser')
def deleteUser(UserId):
    body = request.json
    UserId = body['ID']
    key = "user:" + UserId + ":details"
    user = redDict(redis = pot_con, key = key)
    for keys in body:
        user.pop(keys)

'''
#/updateUser
@post('/updateuser')
def updateUser():
    body = request.json
	key = "user:" + str(body["Id"]) + ":details"
    user = redDict(redis = pot_con, key = key)
    for key in body:
		if key != 'id':
			user[key] = body[key]
'''

'''
Restaurant: pottery dictionary
-name
-restId(primaryKey and artificial key)
-phone no list
-lat
-long
-delivery Radius
-extra dets
'''

'''
{"name":"New Punjabi Food Corner",
"phone":963852741,
"lat":12.844706
"long":77.665583,
"radius":5}
{"name":"Hyderabadi Spice",
"phone":963852741,
"lat":12.8339903,
"long":77.66395,
"radius":5}
{"name":"Domino's Pizza",
"phone":963852741,
"lat":12.844496,
"long":77.665640,
"radius":5}
'''

@post('/addrest')
def addRestaurant():
    body = request.json
    rest_id = next(rest_ids)
    key = "rest:"+str(rest_id)+":details"
    rest = redDict(redis = pot_con, key = key)
    rest['ID'] = rest_id
    for key in body:
        rest[key] = body[key]

@post('/updaterest')
def updateRestaurant():
    body = request.json
    key = "rest:"+str(body["ID"])+":details"
    rest = redDict(redis = pot_con, key = key)
    for key in body:
        rest[key] = body[key]
'''
Offers
-id
-restId
-qty_left
-qty_sold
-accompaniments
-dishName
-originalPrice
-offerPrice
'''



def addOffer(body):
'''
def claimOffer(body):
'''

'''
Orders
-orderId
-OfferId
-usrId
-qty
-accompanyments
-status
-delivery boi
-

'''

install(EnableCors())
run(host='0.0.0.0', port=3000, debug=True, server='gevent')
