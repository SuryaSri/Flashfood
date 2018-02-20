/* Vaibhav Aggarwal 4 july,2017 */

'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const apiaiApp = require('apiai')('b5197f58ead44a4d8e542dd3cf3d717e');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
//var mongo = require('mongodb');
//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/mydb";
var http = require('http');
var Promise = require("bluebird");
var request_1 = Promise.promisifyAll(require("request"));
var activelink ='https://332ce7c0.ngrok.io/';
var recommendationLink = 'https://332ce7c0.ngrok.io';
let token = 'EAAHdua7I9ZAsBAKyT44RgxnO5h6WzHulrG0TaukJQcIJ1Rl4PQyBo1zYLQt6g5rbGWLM8VuVqld94ESnxYKtQHnZClBcOyq0SRBPgK3u8kdHW5FHPmTKTJ9Oo5CXBXKRbsCMzxS4acD3PnAQTegGIwIq976cCapU0dZBwMBdAZDZD';


// The rest of the code implements the routes for our Express server.
let app = express();
let aiText="";
let biText={};
let flag = 0;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true
}));

// Webhook validation
app.get('/', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
                req.query['hub.verify_token'] === 'tuxedo_cat') {
                        console.log("Validating webhook");
                res.status(200).send(req.query['hub.challenge']);
          }
  else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
  }
});



// Display the web page
app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(messengerButton);
    res.end();
});


//offers
app.get('/offers',function(req,res){
  var userId=req.body.id;
  var dish=req.body.dish;
  var name = req.body.name;
  var aiText= "Hey" + name +"! We've a offer for you";
  if(userId){
    //offers
    //name
    //rest
    sendButton(userId,["postback","postback"],aiText,["quickBuy:"+offerId,"Accompaniments:"+offerId],["Quick Buy","Accompliments"],tall);
  }
  res.sendStatus(200);
});

app.post('/', function (req, res) {
        var data = req.body;
        console.log(data);

        // Make sure this is a page subscription
        if (data.object === 'page') {

                // Iterate over each entry - there may be multiple if batched
                data.entry.forEach(function(entry) {
                        var pageID = entry.id;
                        var timeOfEvent = entry.time;

                        // Iterate over each messaging event
                        entry.messaging.forEach(function(event) {
                                if (event.message) {
                                        if(("quick_reply" in event.message)==true){
                                                QuickReplyParser(event.sender.id, event.message.quick_reply.payload);
                                        }
                                        else if ("attachments" in event.message){
                                                if (event.message.attachments[0].type=="location"){
                                                        var link = activelink + event.sender.id + '/set_add/'+event.message.attachments[0].payload.coordinates.lat+','+event.message.attachments[0].payload.coordinates.long;
                                                         var messageData = {
                                                            ID: event.sender.id,
                                                            lat: event.message.attachments[0].payload.coordinates.lat,
                                                            long: event.message.attachments[0].payload.coordinates.long
                                                        };
                                                       // var link = activelink + sender + '/addUser/' + latval + ',' + longval;
                                                        callPost("adress_option",event.sender.id,messageData,'addUser');
                                                }
                                                else
                                                console.log("other attachment");
                                        }
                                        else{
                                                sendMessage(event);
                                        }
                                }
                                else if (event.postback) {
                                        receivedPostback(event);
                                }
                                else {
                                        console.log("Webhook received unknown event: ", event);
                                }
                        });
                });
                // Assume all went well.
                //
                // You must send back a 200, within 20 seconds, to let us know
                // you've successfully received the callback. Otherwise, the request
                // will time out and we will keep trying to resend.
                res.sendStatus(200);
        }});


//send message
function sendMessage(event){
  let sender = event.sender.id;
  let text = event.message.text;
  let apiai = apiaiApp.textRequest(text, {
          sessionId: sender // use any arbitrary id
        });
  

  //sending response to facebook
  apiai.on('response', (response) => {
          console.log(response);
          var condition=response.result.metadata.intentName
          var aiText=response.result.fulfillment.speech;
          var operation;
          
          if(condition==='Greeting!'){
            operation=activelink + 'getUser/' + sender;
            console.log(operation)
            callCondition("user_status",sender,operation,aiText);
            
          }



        });
        apiai.on('error', (error) => {
                console.log(error);
        });
        apiai.end();
  }



function receivedPostback(event) {
        console.log("received")
        var sender = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback
        var payload = event.postback.payload;

        console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", sender, recipientID, payload, timeOfPostback);

        // When a postback is called, we'll send a message back to the sender to
        // let them know it was successful
        // sendTextMessage(sender, "Postback called");
        if (payload) {
                // If we receive a text message, check to see if it matches a keyword
                // and send back the template example. Otherwise, just echo the text we received.
                //sendGenericMessage_getstarted(sender,messageText);
                if(payload.indexOf("quickBuy")+1){
                  //api call
                  //quick reply
                  sendButton(sender,"How many would you like ?",["1","2","3"],["QB:"+offerId+";1","QB:"+offerId+";2","QB:"+offerId+";3"]);

                }
             //   else if(payload.indexOf("Accompaniments")){
                  //api call;
                  //list view
                  //dataRequest(sender,title,images);
               // }
                else if(payload.indexOf("Buy.Accompaniments")){
                  //var offer id
                  //api call
                  //userid,AccompanimentsId
                }
                 console.log("payload:"+payload);
                switch (payload) {


                        case 'VEG_OFFERS':
                              //callredis
                              console.log(payload + " sender: " + sender);
                        break;
                        case 'NON_VEG_OFFERS':
                        //callredis
                              console.log(payload + " sender: " + sender);
                        break;
                        case 'UNSUBSCRIBE':
                              console.log(payload + " event: " + sender);
                        break;
                        case 'SUBSCRIBE':
                          //ask name 
                          console.log(payload + "event:" + sender);
                          var messageData={
                            ID:sender,
                            name:"vaibhav",
                            subscribed:1
                          };
                          console.log(messageData)
                          callPost("greeting",sender, messageData, "addUser")
                        break;
                       // case 'change_address'
                        default:
                                console.log("hgdhd"+payload);
                                SpecialIntents(payload,sender);
                        break;
                }
        }
}

  function SpecialIntents(payload, sender) {
        let apiai = apiaiApp.textRequest(payload, {
            sessionId: sender // use any arbitrary id
        });
        //sending response to facebook
        apiai.on('response', (response) => {
            console.log("dfds"+response.result.action);
            if (response.result.action === "set.location") {
                aiText = response.result.fulfillment.speech;
                sendTextMessage(sender,aiText);
               
            }else if (response.result.action === "process.card") {
                console.log(response.result);
                aiText = response.result.fulfillment.speech;
                sendTextMessage()
            }
        });
        apiai.on('error', (error) => {
            console.log(error);
        });
        apiai.end();
    }


//Api calls
function callCondition(tags,sender,operation,aiText){
  console.log(operation)
  request_1.getAsync({
    url:operation,
    method:'GET'
  }).then(function(res, err){
    var body=JSON.parse(res.body);
    console.log(res.body);
    if(err) throw err;
    if(tags="user_status"){
      if(body.subscribed===0){


       // sendTextMessage(sender,aiText);
        sendButton(sender,["postback"],"Please Subscribe to get the best food in town at half the prices", ["SUBSCRIBE"],["SUBSCRIBE"],"tall")
      }

      if(body.subscribed===1 && body.location===1){
          sendTextMessage(sender, "You've selected this address: "+body.decoded_address)
          CustomQuickreply(sender,"fdfds",2);
      }

      if(body.subscribed===2){

      }
    }

  })
}

function callPost(tag,sender, messageData,callName){
    console.log(messageData)
    request({
      uri:activelink + callName,
      method:'POST',
      json: messageData
    }, function(error, response, body){
      if(error) throw error;
      console.log("fefd"+JSON.stringify(response.body));
      var result=(response.body);
      if(tag==='greeting'){
            if(result.subscribed===1 && result.location===0){
                console.log("ewe");
                CustomQuickreply(sender,"put location",1);
           }

            else if (result.subscribed===1 && result.location==1){
            //dataRequest(sender, titles, images )
            }
      }

      else if(tag==="adress_option"){
        sendTextMessage(sender,"You've selected this address:" + result.decoded_address);
        //CustomQuickreply(sender,"Select from the options",1)
        sendButton(sender,["postback"],"Enter the Place adress, If any other particulars",["Change adress"],["change_address"],"tall");
      }
    })
}

 function callSendRedisAddress(operation, sender) {
        request_1.getAsync({
            url: operation,
            method: 'GET'
        }).then(function(res, err) {
            var body = ''; // Will contain the final response
            if (err) throw err;
            //console.log(res.calls)
            var response = JSON.parse(res.body)
            console.log('vava' + res.body)
            if(response.status==='shut_down'){
                sendTextMessage(sender,"sorry, store near you is shut down")

            }
            if(response.status==='out_of_range'){
                sendTextMessage(sender,"Sorry, we currently do not serve in your area")
            }

            else if(response.tags==='menu'){
                 var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
                 sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
            }

            else{
            if (response.status === 'None')

            {
                sendTextMessage(sender, "We are sorry but we currently do not serve in your area. Please try again later.")
            } else if (response.tags === 'New_user' || response.tags==='saved_address') {
                console.log('fshkjsf')
                aiText = "Thank you, How may I help you?"
                var link = "http://genii.ai/activebots/Babadadhaba?userId=" + sender;
                sendButton(sender, ["postback", "postback", "web_url"], aiText, ["Show_specials", "Recommend", link], ["Specials", "Recommendations", "Menu"], "tall");
            } else if (response.tags === 'recommend' || response.tags === 'specials' || response.tags==='recommend_specific') {
                var operation = response.calls
                callrecommend(operation, sender)
            } else if (response.calls) {
                console.log(response.calls[0])
                var operation = response.calls
                var tag = response.tags
                var text = 'Thanks! How may I help you?'
                console.log(JSON.stringify(operation))

                callSendRedisapi(tag, operation, sender, text)


            }
        }



        });
    }

//functions
 function QuickReplyParser(sender, payload) {
        console.log(payload);
        if (payload === 'Recommend') {
            callrecommend(recommendationLink + sender + '/get_history_reco', sender);
        } else if (payload === 'Show_menu') {
            var link = "http://genii.ai/activebots/Babadadhaba" + "?userId=" + sender;
            sendButton(sender, ["web_url"], "what would to like to have?", [link], ["Show Menu!"], "tall");
        } else if (payload === 'Show_cart') {
            var show = 'get_cart_price/' + sender;
            var final = activelink + show;
            callSendRedis(final, sender);
        } else if (payload === 'Clear_cart') {
            var cancel = 'cart/' + sender + '/cancel';
            final = activelink + cancel;
            aiText = 'Your cart has been cleared. Is there anything else I can help you with?';
            callSendRedisapi('cancel', final, sender, aiText);
        } else if (payload === 'Confirm_order') {
            aiText = "Do you want to confirm this order?";
            sendTextMessage(sender, aiText);
            var show = 'get_cart_price/' + sender;
            var final = activelink + show;
            callSendRedisconfirm(final, sender);
        } else if (payload === 'Confirm_yes') {
            CustomQuickreply(sender, "Please choose your delivery address");
        } else if (payload.search('Payment') >= 0) {
            console.log("dasdads")
            var lat = payload.search('Lat:');
            var long = payload.search(', Long: ');
            var end = payload.search('}');
            var latval = payload.substring(lat + 4, long);
            var longval = payload.substring(long + 8, end);
            var messageData = {
              ID: sender,
              lat: latval,
              long: longval
            };
            var link = activelink + sender + '/addUser/' + latval + ',' + longval;
            callPost("adress_option",sender,messageData, 'addUser');
            console.log(link);
            console.log("Hi" + payload);
           // callSendRedisAddress(link, sender);
            //callSendRedisapi("payment",sender,link,"How would you like to pay?");
        } else if (payload === "order_status") {
            console.log("dfghj");
            var link = activelink + sender + '/set_address/' + JSON.stringify(payload.replace(/\s+/g, '_'));
            var operation = activelink + "cart/" + sender + "/status";
            console.log(operation);
            callSendRedisapi("orderstatus", operation, sender, "nothing");
            //sendTextMessage(sender,res.body);
            //sendQuickreply(sender,".",["Check Status"],["order_status"]);
        } else if (payload.search('Save_address') >= 0) {
            console.log("address saving");
            if (payload.search('Location1') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc1/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location2') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc2/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location3') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc3/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else if (payload.search('Location4') >= 0) {
                var lat = payload.search('Lat: ');
                var long = payload.search(', Long: ');
                var end = payload.search('}');
                var latval = payload.substring(lat + 5, long);
                var longval = payload.substring(long + 8, end);
                var link = activelink + sender + '/set_address/loc4/' + latval + ',' + longval;
                console.log(link);
                callSendRedisAddress(link, sender);
            } else {
                var title = ["Address1", "Address2", "Address3", "Address4"];
                var payloadArr = ["Location1_" + payload, "Location2_" + payload, "Location3_" + payload, "Location4_:" + payload];
                sendQuickreply(sender, "Save it as", title, payloadArr);
            }
        }
            else if(payload==='set_saved_address'){
                var link=activelink+'use_saved/'+sender
                callSendRedisAddress(link,sender)
            }
        console.log(payload);
    }
function CustomQuickreply(recipientId, text, flag) {
        console.log(text);
        if(flag==1){
        var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
                "text": text,
                "quick_replies": [{
                    "content_type": "location",
                }]
            }
        };
        }
        else{
             var messageData = {
            "recipient": {
                "id": recipientId
            },
            "message": {
                "text": text,
                "quick_replies": [{
                    "content_type": "location",
                },
                {content_type: "text",
                title: 'Saved Address',
                payload: 'set_saved_address'}
                ]
            }
        };
        }
        callSendAPI(messageData);
    }

function sendQuickreply(recipientId,text,title,payload) {
        var messageData = {
                recipient :{
                        id: recipientId
                },
                message: {
                        text:text,
                        quick_replies:[
                        ]
                }
        };
        var filler;
        for (var i=0;i<title.length;i++)
        {
                filler ={
                        content_type:"text",
                        title:title[i],
                        payload:payload[i]
                };
                messageData.message.quick_replies.push(filler);
        }
        callSendAPI(messageData);
}


function sendButton(recipientId,type,text,payload,caption,size){
  console.log("called")
        var messageData={
                recipient:{
                        id:recipientId
                },
                message:{
                        attachment:{
                                type:"template",
                                payload:{
                                        template_type:"button",
                                        text:text,
                                        buttons:[

                                        ]
                                }
                        }
                }
        };
        var filler;
        for (var i=0;i<type.length;i++)
        {
                if (type[i]==="web_url"){
                        filler ={
                                type:type[i],
                                title:caption[i],
                                url:payload[i],
                                webview_height_ratio:size
                        };
                        messageData.message.attachment.payload.buttons.push(filler);
                }
                else if (type[i]==="postback"){
                        filler ={
                                type:type[i],
                                title:caption[i],
                                payload:payload[i],
                        };
                        messageData.message.attachment.payload.buttons.push(filler);
                }
        }
        callSendAPI(messageData);
}

function dataRequest(recipientId,titles,images,offerId){
  var title=titles;
  var imageurl=images;//put default image
  var offerId = offerId;
  var cards =new Array(title.length);
  var string;
  var i;
  for(var j=0;j<titles.length;j++){
          title[j] = toTitleCase(titles[j].replace(/_/g, ' '));
  }
  for(i=0;i<title.length;i++){
          string=makeJson(title[i],imageurl,offerId[i]);
          cards[i]=string;
  }
  console.log(cards);
  var messageData = {
          recipient :{
                  id: recipientId
          },
          message: {
                  attachment: {
                          type: "template",
                          payload: {
                                  template_type: "list",
                                  elements:cards
                          }
                  }
          }
  };
  //console.log(messageData);
  // console.log(messageData.message.attachment.payload);
  callSendAPI(messageData);
}
function makeJson(title,imageurl){
      //  var title1=title.substring(0,title.indexOf(" - Rs."));
        var elements={
                title: title,
                image_url:imageurl,
                buttons: [
                        {
                                type: "postback",
                                title: "Buy ",
                                payload: "Buy.Accompaniments:" + offerId
                        }
                ],
        }
        console.log(title);
        return elements;
}

function sendTextMessage(recipientId, messageText) {
        var messageData = {
                recipient: {
                        id: recipientId
                },
                message: {
                        text: messageText
                }
        };
        callSendAPI(messageData);
}



function sendQuickreply(recipientId,text,title,payload) {
        var messageData = {
                recipient :{
                        id: recipientId
                },
                message: {
                        text:text,
                        quick_replies:[
                        ]
                }
        };
        var filler;
        for (var i=0;i<title.length;i++)
        {
                filler ={
                        content_type:"text",
                        title:title[i],
                        payload:payload[i]
                };
                messageData.message.quick_replies.push(filler);
        }
        callSendAPI(messageData);
}

function QuickReplyParser(sender,payload){
  console.log(payload);
  var quickBuy = payload.search("QB:");
  if(quickBuy===0){
    var qbid = payload.search('QB:');
    var end= payload.search(';');
    var offerid = payload.substring(qbid+3,end);
    var quantity = payload.substring(end+1,end+2);
    ///make api call
  }
}

function callSendAPI(messageData) {
        request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: { access_token: token },
                method: 'POST',
                json: messageData
        }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                        var recipientId = body.recipient_id;
                        var messageId = body.message_id;
                        console.log("Successfully sent generic message with id %s to recipient %s",
                        messageId,recipientId);
                }
                else {
                        //console.error("Unable to send message.");
                        console.error(response);
                        //console.error(error);
                }
        });
}

// Set Express to listen out for HTTP requests


var server = app.listen(process.env.PORT || 3000, function () {
        console.log("Listening on port %s", server.address().port);
});
