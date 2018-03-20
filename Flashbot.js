'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const apiaiApp = require('apiai')('b5197f58ead44a4d8e542dd3cf3d717e');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Facebook Messenger Bot</h1>This is a bot based on Messenger Platform QuickStart. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
var http = require('http');
var Promise = require("bluebird");
var request_1 = Promise.promisifyAll(require("request"));
var activelink ='https://1c198609.ngrok.io/';
var recommendationLink = 'https://1c198609.ngrok.io/';
let token = 'EAAHdua7I9ZAsBAOyIhP5vyDAxWzjQjX7OsRYogfA4tgI8ZA5JO84IjUV8glnio1ZAT4nPvAu2uscAu4NcSHoAgIUQWnDXldwyhEro7jlfjtAZABnu1epU9pZBZAZCGPVFp1cUdoWk1GOZA743blIrwbCVGjwclpFUnGaG6tW79GcSgZDZD';


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

          else if(response.result.action  === 'show.offer'){
             console.log("dffdf");
             var operation = activelink + "getOffers/" + sender;
             callCondition("offers", sender, operation, "Here are the awesome offers for you!")
          }
          else if (response.result.action === "process_card.process_card-selectnumber") {
                var dish = toTitleCase(response.result.parameters.dish) ;
                var number = response.result.parameters.number;
                var dict = {};
                dict[dish] = number;
                var myjson = JSON.stringify(dict);
                var finalDict = "";
                for (var i = 0; i < myjson.length; i++) {
                    if (myjson[i] === ' ')
                        finalDict += ' ';
                    else
                        finalDict += myjson[i];
                }
                finalDict = finalDict;
                var add = 'claimoffer/' + sender  ;
                var final = activelink + add;

                console.log(add);
                var reply = response.result.fulfillment.speech;
                //var reply="A "+ payload + " has been added";
             //dfds   callSendRedisapi('add', final, sender, reply);
                callPost("add", sender, finalDict, "claimOffer/" + sender)
              }


          //popular offers
          else if(response.result.action === 'popular.offer'){
              
              var operation = activelink + "showPopulars/" + sender;
              callCondition("showPopulars", sender, operation, "Here are the popular offers in your area!")

          }

          else if(response.result.action === "cheap.offer"){

             var operation = activelink + "cheapOffers/" + sender;
             callCondition("cheapOffers", sender, operation, "Here are the cheapest offers in your area!")

          }

          else if(response.result.action === "Confirm.Confirm-yes"){

            var operation = activelink + "confirm/" + sender + "/" + response.result.parameters['phone-number']
            console.log(operation)
            callCondition("confirm", sender, operation, "Here is the your receipt for your order!")
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
                       case 'getOffers':
                              var operation = activelink + "getOffers/" + sender;
                              callCondition("offers", sender, operation, "Here are the awesome offers for you!")
                        break;
                        case "showCart":
                              var operation = activelink + 'showCart/' + sender;
                              callCondition("showcart", sender, operation, "Here is your cart!")
                        break;
                        case "popularOffers":
                                var operation = activelink + "showPopulars/" + sender;
                                callCondition("showPopulars", sender, operation, "Here are the popular offers in your area!")
                        break;

                        case "cheapOffers":
                               var operation = activelink + "cheapOffers/" + sender;
                               callCondition("cheapOffers", sender, operation, "Here are the cheapest offers in your area!")

                        break;

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
                sendTextMessage(sender, aiText)
            }else if (response.result.action){
               aiText = response.result.fulfillment.speech;
               sendTextMessage(sender, aiText);

            }


        });
        apiai.on('error', (error) => {
            console.log(error);
        });
        apiai.end();
    }

  function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }


//Api calls
function callCondition(tags,sender,operation,aiText){
  console.log(operation + tags)
  request_1.getAsync({
    url:operation,
    method:'GET'
  }).then(function(res, err){
    var body=(res.body);
    console.log(res.body);
    if(err) throw err;
    if(tags==="user_status"){
      body=JSON.parse(body);
      if(body.subscribed===0){


       // sendTextMessage(sender,aiText);
        sendButton(sender,["postback"],"Please Subscribe to get the best food in town at half the prices", ["SUBSCRIBE"],["SUBSCRIBE"],"tall")
      }

      if(body.subscribed===1 && body.location===1){
          sendTextMessage(sender, "You've selected this address: "+body.decoded_address)
         // CustomQuickreply(sender,"fdfds",2);
          var operation = activelink + "getOffers/" + sender;
          callCondition("offers", sender, operation, "Here are the awesome offers for you!")
      }

    }

      else if(tags==="offers"){
         //console.log("offers response"+res.body);
        body=JSON.parse(body);
         console.log(body.length);
         if(body.length != 0){
         
            var dish = [], link =[], offerPrice =[], originalPrice=[], restName=[];

            for(var i=0; i<body.length; i++){
                dish.push(body[i]["dish"] + " - Rs. " + body[i]["offerPrice"]);
                link.push(body[i]["link"])
                //ferPrice.push(body[i]["offerPrice"])
                originalPrice.push(body[i]["originalPrice"])
                restName.push(body[i]["restName"]);
            }

         console.log(dish);
         console.log(originalPrice);
         console.log(restName)
         dataRequest(sender, dish, link, originalPrice, restName); 
       }

       else{

          sendTextMessage(sender, "Sorry! Right now, we don't have any offers available.")
       }


      }

      else if(tags === "showcart"){
        body = JSON.parse(body);
        console.log(body.length)
       // for(var key in body){
          //console.log("sss")
          var c = "Here is your current cart !\n";
          if(body['cart']==="Yes"){
           // console.log(body['status'])
            if(body['status'][0]==="Yes"){
              console.log(body['dish'])
              for(var i=0; i<body['dish'].length; i++){
                console.log(body['dish'][i])
                c += '('+ body['dish'][i]+')'+' x '+ body['qty'][i]+ ' = ' + body['price'][i] * body['qty'][i] +"\n";
                
              }
              console.log(c)

            }
        }
        

       
        sendButton(sender, ["postback", "postback"],c, ["getOffers", "CONFIRM"], ["More Offers", "Confirm"], "tall");
      }

      //popular offers
      else if (tags === "showPopulars"){
         //console.log("offers response"+res.body);
         body=JSON.parse(body);
         console.log(body.length);
         if(body.length != 0){
         
            var dish = [], link =[], offerPrice =[], originalPrice=[], restName=[];

            for(var i=0; i<body.length; i++){
                dish.push(body[i]["dish"] + " - Rs. " + body[i]["offerPrice"]);
                link.push(body[i]["link"])
                //ferPrice.push(body[i]["offerPrice"])
                originalPrice.push(body[i]["originalPrice"])
                restName.push(body[i]["restName"]);
            }

         console.log(dish);
         console.log(originalPrice);
         console.log(restName)
         dataRequest(sender, dish, link, originalPrice, restName); 
       }

       else{

          sendTextMessage(sender, "Sorry! Right now, we don't have any offers available.")
       }

    }


      //cheap offers
      else if(tags === "cheapOffers"){
             body=JSON.parse(body);
         console.log(body.length);
         if(body.length != 0){
         
            var dish = [], link =[], offerPrice =[], originalPrice=[], restName=[];

            for(var i=0; i<body.length; i++){
                dish.push(body[i]["dish"] + " - Rs. " + body[i]["offerPrice"]);
                link.push(body[i]["link"])
                //ferPrice.push(body[i]["offerPrice"])
                originalPrice.push(body[i]["originalPrice"])
                restName.push(body[i]["restName"]);
            }

         console.log(dish);
         console.log(originalPrice);
         console.log(restName)
         dataRequest(sender, dish, link, originalPrice, restName); 
       }

       else{

          sendTextMessage(sender, "Sorry! Right now, we don't have any offers available.")
       }
      }


      //confirm
      else if(tags === "confirm"){
        var b= JSON.parse(body)
        console.log(body.length)
        console.log(b['body'])
        body = b['body']

        var dish = []
        var qty = []
        var price = []
        if(body['cart']==="Yes"){
           console.log(body['status'])
            if(body['status'][0]==="Yes"){
              console.log(body['dish'])
              for(var i=0; i<body['dish'].length; i++){
                console.log(body['dish'][i])
                dish.push(body['dish'][i])
                qty.push(body['qty'][i])
                price.push(body['price'][i])
                
              }
              
            }

            else{

            }

            console.log(dish)
            console.log(qty)
            console.log(price)
            console.log(b['total'])
            console.log(b['name'])
            console.log(b['number'])

          }

          sendReciept(sender, b['total'], b['name'], b['total'], dish, qty, price, "ddress", b['name'], b['number'])
      }

  })
}

function sendReciept(recipientID,newdiscount,name,total,titles,quantity,price,address,Name,Num){
        var cards =new Array(titles.length);
        var string;
        var i;
        for(var j=0;j<titles.length;j++){
                titles[j] = toTitleCase(titles[j].replace(/_/g, ' '));
        }
        for(i=0;i<titles.length;i++){
                string=makeJsonreceipt(titles[i],quantity[i],price[i]);
                cards[i]=string;
        }
        var messageData={
                "recipient":{
                        id:recipientID
                        },
                message:{
                        attachment:{
                                type:"template",
                                payload:{
                                    
                                        template_type:"receipt",
                                        recipient_name:Name,
                                        order_number:recipientID,
                                        currency:"INR",
                                        payment_method:"Cash on Delievery",
                                        order_url:"http://babadadhaba.co/",
                                        timestamp:"1428444852",
                                        elements:cards,
                                        address:{
                                                street_1:address,
                                                street_2:"",
                                                city:"Phone Number",
                                                postal_code:Num,
                                                state:" : ",
                                                country:" India "
                                        },
                                        summary:{
                                                subtotal:total,
                                                shipping_cost:0.00,
                                                total_tax:0.00,
                                                total_cost: total
                                        },
                                        adjustments:[
                                                {
                                                        name:"New Customer Discount",
                                                        amount:newdiscount
                                                },
                                                {
                                                        name:"10 Off Coupon",
                                                        amount:10
                                                }
                                        ]
                                }
                        }
                }
        };
        callSendAPI(messageData);
}

function makeJsonreceipt(title,quantity,price){
        var elements={
                title: title,
                quantity : quantity,
                price : price,
                currency:"INR",
                image_url:"http://assets.limetray.com/assets/user_images/logos/original/Logos_1464774908.png"
                }
        return elements;
}

function makeJson(title,imageurl){
        var title1=title.substring(0,title.indexOf(" - Rs."));
        var elements={
                title: title,
                image_url:imageurl,
                buttons: [
                        {
                                type: "postback",
                                title: "Buy "+ title1,
                                payload: "dish.buying:" + title1
                        }
                ],
        }
        console.log(title);
        return elements;
}

function callPost(tag,sender, messageData,callName){
    console.log(messageData + tag)
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
              sendTextMessage(sender, "You have selected " + response.decoded_address + " as your address.")
            //dataRequest(sender, titles, images )
            }
      }

      else if(tag==="adress_option"){
        sendTextMessage(sender,"You've selected this address:" + result.decoded_address);
         var operation = activelink + "getOffers/" + sender;
          callCondition("offers", sender, operation, "Here are the awesome offers for you!")
        //CustomQuickreply(sender,"Select from the options",1)
       // sendButton(sender,["postback"],"Enter the Place adress, If any other particulars",["Change adress"],["change_address"],"tall");
      }

      else if(tag==="add"){
        console.log(result.status)
        if(result.status=='Yes'){
          console.log("jkj")
          var message = "Your dish " + result.dish + " has been added."
          sendButton(sender,["postback","postback"],message,["getOffers","showCart"],["More Offers", "Show Cart"],"tall");
        }
        else if(result.status=="No"){
          sendTextMessage(sender, "We have " + result.remaining + " of " + result.dish + " remaining.")
        }
        console.log("dschuijd")
      }


      //confirm
      else if(tag === "confirm"){

        sendTextMessage(sender, "confirmed")
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
                console.log("saved adress1")
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


    function dataRequest(recipientId, titles, images, originalPrice, restName) {
        var title = titles;
        var imageurl = images;
        var cards = new Array(title.length);
        var string;
        var i;
        for (var j = 0; j < titles.length; j++) {
            title[j] = toTitleCase(titles[j].replace(/_/g, ' '));
        }
        for (i = 0; i < title.length; i++) {
            string = makeJson(title[i], imageurl[i], originalPrice[i], restName[i]);
            cards[i] = string;
        }
        console.log(cards);
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: cards
                    }
                }
            }
        };
        //console.log(messageData);
        // console.log(messageData.message.attachment.payload);
        callSendAPI(messageData);
        sendButton(recipientId, ["postback", "postback"], "Select any option below.", ["cheapOffers", "popularOffers"], ["On A Budget", "Popular offers"], "tall")
    }
  //console.log(messageData);
  // console.log(messageData.message.attachment.payload);}

function makeJson(title, imageurl, oPrice, rName) {
        var title1 = title.substring(0, title.indexOf(" - Rs."));
        var elements = {
            title: title,
            image_url: imageurl,
            subtitle: "Original Price:Rs " +oPrice + "\n" + rName,
            buttons: [{
                type: "postback",
                title: "Buy " + title1,

                payload: "dish.buying:" + title1
            }],
        }
        console.log(title1)
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


var server = app.listen(process.env.PORT || 5000, function () {
        console.log("Listening on port %s", server.address().port);
});
