/**
 * twilio.js
 *
 * Express app that uses Twilio.
 */

var accountSid = ''; // Your Account SID from www.twilio.com/console
var authToken = ''; 

var express = require('express')
var bodyParser = require('body-parser')
var twilio = require('twilio');
var request = require('request')
var cors = require('cors')


// Create our app. Create our routes and start our server up.
var app = express()
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))

// Pass in Account SID and Auth Token to twilio() if not set as environment
// variables.
var client = new twilio.RestClient(accountSid, authToken);

// When a GET request comes into this root URL.
app.get('/', function (req, res) {
  var options = {
			url: 'http://localhost:3000/profiles/by-phone/' + '2223334444' + '/json'
	}

	request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
				var profile = JSON.parse(body)

				id = profile.profile[0]._id
   	}


  })

res.send('Hello, World!')
})

app.post('/message', function (req, res){
  // See: https://www.twilio.com/docs/api/twiml/sms/twilio_request
  const from = req.body.From
  const body = req.body.Body
  client.sendMessage({
    to: from,
    from: '+13474640283',
    body: "Responding Back"
  })

  var options = {
		url: 'http://localhost:3000/profiles/by-phone/' + '2223334444' + '/json'
	}
	
	request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body); // Show the HTML for the Modulus homepage.
        var profile = JSON.parse(body)
				console.log(profile.profile[0]._id)

				id = profile.profile[0]._id

				// Add call to update profile. 
   	}
  })
})

app.listen(3300, function() {
	console.log('CORS-enabled web server listening on port 3300');
})