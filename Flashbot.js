/* Vaibhav Aggarwal 4 july,2017 */

'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const apiaiApp = require('apiai')('9afd07100b9a4f27ae0f03eda9e3c752');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
//var mongo = require('mongodb');
//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/mydb";
var http = require('http');
var Promise = require("bluebird");
var request_1 = Promise.promisifyAll(require("request"));
var activelink ='http://129.144.182.67:4000/';
var recommendationLink = 'http://129.144.182.67:3000/';
let token = 'EAAHdua7I9ZAsBAIe35E2alaTAUdWOnytPWs4WU2PNfAMZAM9ZBEouHTMB2Hfkmd23T71NdTjgMP96m3283ClExFfZBqffkFFk5OYsxt0SdVS4zlRsBZBQANrxRnOj12koScNcz1AUELi3Ix690ZA2XxSxv0dOMnszxVqGX15WMfR8PoFWXS16f';


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
})

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
                                                        var link = activelink + event.sender.id + '/set_address/'+event.message.attachments[0].payload.coordinates.lat+','+event.message.attachments[0].payload.coordinates.long;
                                                        callSendRedisAddress(link,event.sender.id);
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
        });
        apiai.on('error', (error) => {
                console.log(error);
        });
        apiai.end();
  }


function receivedPostback(event) {
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
                  sendQuickreply(sender,"How many would you like ?",["1","2","3"],["QB:"+offerId+";1","QB:"+offerId+";2","QB:"+offerId+";3"]);

                }
                else if(payload.indexOf("Accompaniments")){
                  //api call;
                  //list view
                  dataRequest(sender,title,images);
                }
                else if(payload.indexOf("Buy.Accompaniments")){
                  var offer id
                  //api call
                  //userid,AccompanimentsId
                }
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

                        default:
                                console.log(payload);
                              //  SpecialIntents(payload,sender);
                        break;
                }
        }
}

//functions
function sendButton(recipientId,type,text,payload,caption,size){
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

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
        console.log("Listening on port %s", server.address().port);
});
