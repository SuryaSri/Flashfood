const request = require('request');

var activelink = 'https://1c198609.ngrok.io/'

module.exports =  function(sender, messageData){
	  
	  var messageData = {"data":[{"restID":3,"qty_left":10,"qty_sold":0,"dish":"Chicken Tikka","originalPrice":120,"offerPrice":70,"type":"Starters[Non-Veg]"},
{"restID":2,"qty_left":5,"qty_sold":0,"dish":"Chicken Makhanwala","originalPrice":120,"offerPrice":100,"type":"Starters[Non-Veg]"},
{"restID":3,"qty_left":6,"qty_sold":0,"dish":"Hariyali Chicken Kebab","originalPrice":150,"offerPrice":110,"type":"Starters[Non-Veg]"},
{"restID":2,"qty_left":4,"qty_sold":0,"dish":"Malai Chicken Kebab","originalPrice":130,"offerPrice":100,"type":"Kebab"},
{"restID":3,"qty_left":8,"qty_sold":0,"dish":"Mutton Seekh Kebab","originalPrice":250,"offerPrice":150,"type":"Kebab"},
{"restID":2,"qty_left":8,"qty_sold":0,"dish":"Mutton Biryani","originalPrice":170,"offerPrice":110,"type":"Biryani"},
{"restID":3,"qty_left":8,"qty_sold":0,"dish":"Chiken Biryani","originalPrice":200,"offerPrice":150,"type":"Biryani"},
{"restID":2,"qty_left":8,"qty_sold":0,"dish":"Mutton Rogan Josh","originalPrice":170,"offerPrice":120,"type":"Kebab"}]}
 

 	var activelink = 'https://1c198609.ngrok.io/';
    console.log(messageData)
    //console.log(activelink)
      request({
      uri:activelink + 'addOffers',
      method:'POST',
      json: messageData
    }, function(error, response, body){
      if(error) throw error;
      //console.log(response.body)

	})
		return "Successfully added dishes";
	}

	

var messageData = {"data":[{"restID":3,"qty_left":10,"qty_sold":0,"dish":"Chicken Tikka","originalPrice":120,"offerPrice":70,"type":"Starters[Non-Veg]"},
{"restID":2,"qty_left":5,"qty_sold":0,"dish":"Chicken Makhanwala","originalPrice":120,"offerPrice":100,"type":"Starters[Non-Veg]"},
{"restID":3,"qty_left":6,"qty_sold":0,"dish":"Hariyali Chicken Kebab","originalPrice":150,"offerPrice":110,"type":"Starters[Non-Veg]"},
{"restID":2,"qty_left":4,"qty_sold":0,"dish":"Malai Chicken Kebab","originalPrice":130,"offerPrice":100,"type":"Kebab"},
{"restID":3,"qty_left":8,"qty_sold":0,"dish":"Mutton Seekh Kebab","originalPrice":250,"offerPrice":150,"type":"Kebab"},
{"restID":2,"qty_left":8,"qty_sold":0,"dish":"Mutton Biryani","originalPrice":170,"offerPrice":110,"type":"Biryani"},
{"restID":3,"qty_left":8,"qty_sold":0,"dish":"Chiken Biryani","originalPrice":200,"offerPrice":150,"type":"Biryani"},
{"restID":2,"qty_left":8,"qty_sold":0,"dish":"Mutton Rogan Josh","originalPrice":170,"offerPrice":120,"type":"Kebab"}]}

