import bottle
import json
import googlemaps
import random
import pandas as pd
from bottle import get, post, request, run, install, response , route
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
pot_arc = red.from_url('http://localhost:6379/1')

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
    gmaps = googlemaps.Client(key='AIzaSyBKtTB8dxqymBPAnsfAr5sPWv-UTAWGZtY')
    reverse_geocode_result = gmaps.reverse_geocode((lat,longi))
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
-int confirmed_carts
-int subscribed
'''

@post('/addUser')  #post request to add the user details.
def addUser():
    body = request.json
    key = "user:" + str(body['ID']) + ":details"
    body.pop('ID')
    user = redDict(redis = pot_con, key = key)
    arch = redDict(redis = pot_arc, key = key)
    if 'decoded_address' not in arch:
        arch = user
        arch['confirmed_carts'] = 0
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
    print(json.dumps(body))
    yield json.dumps(body)

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

Restaurant: pottery dictionary
-name
-restId(primaryKey and artificial key)
-phone no list
-lat
-long
-delivery Radius
-extra dets

{"phone": 963852741, "long": 77.66564, "ID": 1, "name": "Domino's Pizza", "lat": 12.844496, "radius": 5}
{"phone": 963852741, "long": 77.66395, "ID": 2, "name": "Hyderabadi Spice", "lat": 12.8339903, "radius": 5}
{"phone": 963852741, "long": 77.665583, "ID": 3, "name": "New Punjabi Food Corner", "lat": 12.844706, "radius": 5}
'''

@post('/addrest')
def addRestaurant():
    body = request.json
    rest_id = next(rest_ids)
    key = "rest:"+str(rest_id)+":details"
    rest = redDict(redis = pot_arc, key = key)
    rest['ID'] = rest_id
    body['ID'] = rest_id
    for key in body:
        rest[key] = body[key]
    print(json.dumps(body))
    yield json.dumps(body)

@post('/updaterest')
def updateRestaurant():
    body = request.json
    key = "rest:"+str(body["ID"])+":details"
    rest = redDict(redis = pot_arc, key = key)
    for key in body:
        rest[key] = body[key]
    print(json.dumps(body))
    yield json.dumps(body)

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
-link
'''
global OffersDB
OffersDB = pd.DataFrame(data = {}, columns = ['ID','restID','dish','qty_sold','qty_left','type','originalPrice','offerPrice','link','restName'])

@post('/addOffers')
def addOffer():
    global OffersDB
    Offers = []
    body = request.json
    for i in range(len(body['data'])):
        body['data'][i]['ID'] = random.randint(100,999)
        key = "rest:"+str(body['data'][i]['restID'])+":details"
        rest = redDict(redis = pot_arc, key = key)
        body['data'][i]['restName'] = rest['name']
        body['data'][i]['link'] = 'http://genii.ai/activebots/Babadadhaba/img/db/' + body['data'][i]['dish'].replace(" ","-") + ".jpg"
        Offers.append(body['data'][i])
    DB = pd.read_json(json.dumps(Offers),orient='records')
    OffersDB = OffersDB.append(DB, ignore_index = True)

@get('/getOffers/<sender>')
def showoffers(sender):
    global OffersDB
    df = OffersDB.copy(deep = True)
    df.drop(['restID','ID','type','qty_left','qty_sold'],axis = 1, inplace = True)
    yield df.to_json(orient = 'records')

@post('/claimOffer/<sender>')
def claimOffer(sender):
    global OffersDB
    #print(OffersDB)
    result = {'status':[],'remaining':[],'dish':[]}
    body = request.json
    body = str(body)
    body = json.loads(body)
    key = "user:"+ sender + ":details"
    user = redDict(redis = pot_arc, key = key)
    if('confirmed_carts' in user):
        cart = redDict(redis = pot_con, key = "user:"+sender+":cart:"+str(user['confirmed_carts']+1))
    else:
        cart = redDict(redis = pot_con, key = "user:"+sender+":cart:1")
        user['confirmed_carts'] = 0
    for item in body:
        if(OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0]>=int(body[item])):
            cart[item] = body[item]
            result['dish'].append(item)
            result['status'].append('Yes')
            result['remaining'].append(OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0])
        else:
            result['dish'].append(item)
            result['status'].append('No')
            result['remaining'].append(OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0])
    yield json.dumps(result)


@get('/showCart/<sender>')
def showcart(sender):
    global OffersDB
    #print(OffersDB)
    user = redDict(redis = pot_arc, key = "user:" + sender + ":details")
    if('confirmed_carts' in user):
        cart = redDict(redis = pot_con, key = "user:"+sender+":cart:"+str(user['confirmed_carts']+1))
    else:
        cart = redDict(redis = pot_con, key = "user:"+sender+":cart:1")
        user['confirmed_carts'] = 0
    result = {'cart':'','status':[],'qty':[],'dish':[],'remaining':[]}
    #print(result)
    if(len(cart)!=0):
        #print(cart)
        result['cart'] = 'Yes'
        for item in cart:
            if((OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0])>=(int(cart[item]))):
                result['dish'].append(item)
                result['qty'].append(int(cart[item]))
                result['status'].append('Yes')
                result['remaining'].append(OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0])
            else:
                result['dish'].append(item)
                result['qty'].append(int(cart[item]))
                result['status'].append('No')
                result['remaining'].append(OffersDB[OffersDB['dish']==item]['qty_left'].tolist()[0])
        yield json.dumps(result)
    else:
        result['cart'] = 'No'
        yield json.dumps(result)

'''
Orders
-orderId
-OfferId
-usrId
-qty
-accompanyments
-status
-delivery boi
'''
install(EnableCors())
run(host='0.0.0.0', port=3000, debug=True, server='gevent')
