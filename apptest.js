const assert = require('chai').assert;
const app  = require('./app');


describe('App', function(){
	it('app should return successfully added',function(){
		assert.equal(app(), 'Successfully added dishes');
	});
});






//console.log(messageData)