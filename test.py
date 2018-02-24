'''from bottle import get, post, request,run # or route


@post('/login') # or @route('/login', method='POST')
def do_login():
    username = request.json
    print(username,type(username))
    print (username['id'])
    return username

run(host='0.0.0.0', port=4000, debug=True)


'''
import requests
import json

head = {'Content-Type': 'application/json'}
r = requests.get(url="http://0.0.0.0:3000/getUser/1234567890",headers=head)
res = r.json()
if(res['name']==''):
    dta = {'ID': 1234567890, 'name': 'surya'}
r = requests.post(url="http://0.0.0.0:3000/addUser",data = json.dumps(dta),headers=head)
print ("surya",r.text)
data = {'ID':1234567890, 'name':'surya','subscribed':1 }
r1 = requests.post(url='http://0.0.0.0:3000/addUser',data = json.dumps(data),headers=head)

data = r2.json()
print (data)
print(r2.status_code)
print(r2.text)


data = {"1":{"ID":159487263,"name":"restA"
             "offer":50, "dishes":{"dal":[1,100],"paneer":[2, 456]}
             }}
