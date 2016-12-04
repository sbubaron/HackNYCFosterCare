/**
 * twilio.js
 *
 * Express app that uses Twilio.
 */


var credentials = require('./.credentials/twilio.json')
var express = require('express')
var bodyParser = require('body-parser')
var twilio = require('twilio');
var request = require('request')
var cors = require('cors')
var fetch = require('node-fetch')

// Create our app. Create our routes and start our server up.
var app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))

// Pass in Account SID and Auth Token to twilio() if not set as environment
// variables.
var client = new twilio.RestClient(credentials.accountSid, credentials.authToken);

// When a GET request comes into this root URL.
app.get('/', function (req, res) {
  var options = {
    url: 'http://localhost:3000/profiles/by-phone/' + '2223334444' + '/json'
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var profile = JSON.parse(body)

      var id = profile.profile[0]._id
      console.log(id)
    }
  })
  res.send("Hello")
})

app.get('/chat', function (req, res) {
  var options = {
    url: 'http://localhost:3000/profiles/by-phone/' + '2223334444' + '/json'
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var profile = JSON.parse(body)

      var id = profile.profile[0]._id
      console.log(id)
    }
  })
  res.render('chat.ejs')
})

app.post('/chat', function (req, res) {
  var iMsg = req.body.msg.toLowerCase()
  var iPhone = req.body.phone.toLowerCase()
  var state = req.body.state
  var repost = false
  console.log(state)

  var options = {
    url: 'http://localhost:3000/profiles/by-phone/' + iPhone + '/json'
  }
  var profile = null

  if(iMsg === 'help' || iMsg === 'hey iris') {
    state = 'help'
  }

  fetch('http://localhost:3000/profiles/by-phone/' + iPhone + '/json', {
    method: 'get',
    headers: {'Content-Type': 'application/json'}
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {  
    console.log(data)

      if(data != undefined && data.profile != undefined && Array.isArray(data.profile))
        return data.profile[0]
      else
      {
        console.log('null')
        return null
      }
        
  }).then(profile => {
      var response = ''

      switch (state) {

        case 'help':
          if (profile) {
            response = 'Hey ' + profile.name + '! '
            //check if has Active tasks
            if (profile.activeTaskID) {
              state = 'continuing'
              response = 'You have an active task, do you wish to continue (yes) or cancel (no)?'

              res.send({message: response, state: state})
            }
            else {
              state = 'selectTask'

              fetch('http://localhost:3000/tasks/json', {
                method: 'get',
                headers: {'Content-Type': 'application/json'},
              }).then(res => {
                if (res.ok) return res.json()
              })
              .then(data => {
                console.log(data)
                response += 'I can help you: '
                data = data.tasks
                for(var i =0; i<data.length; i++) {
                  console.log(data[i])
                  response += data[i].name + " (" + data[i].trigger + ")"

                  if (i === data.length - 2)
                    response += ' or '
                  else if ( i < data.length - 2)
                    response += ', '
                  else
                    response += '. '
                } 
                res.send({message: response, state: state})                
              })
            }
          }
          else {
            state = 'new_promptName'
            response = 'Hey there, it looks like your new around here, lets set up your profile! What is your name?'
            res.send({message: response, state: state})
          }
        break;

        case 'new_promptName': {
          fetch('http://localhost:3000/profiles/', {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      'cellphone': iPhone,
                      'name': iMsg
                    })
                  }).then(res => {
                    if (res.ok) return res.json()
                  }).then(data => {
                    response = "Hi " + iMsg
                    state = 'help'
                    res.send({message: response, state: state, repost: true})
                  })
        }

        case 'clearTask':

         fetch('http://localhost:3000/profiles/update/by-phone/', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      'activeTaskID': null,
                      'cellphone': iPhone
                    })
                  }).then(res => {
                    if (res.ok) return res.json()
                  }).then(data => {
                    response = ""
                    state = 'help'
                    res.send({message: response, state: state, repost: true})
                  })
      

        break;

        case 'selectTask':

              if(iMsg == 'appointment' || iMsg === 'contact' || iMsg === 'age out info') {

                fetch('http://localhost:3000/tasks/by-trigger/' + iMsg + '/taskitem/json', {
                    method: 'get',
                    headers: {'Content-Type': 'application/json'},
                }).then(res=> {
                  if(res.ok) return res.json()
                }).then(data => {
                  console.log(data)
                  return data.taskItem[0];
                }).then(taskItem => {
                  console.log(taskItem)
                  fetch('http://localhost:3000/profiles/update/by-phone/', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      'activeTaskID': taskItem._id,
                      'cellphone': iPhone
                    })
                  }).then(res => {
                    if (res.ok) return res.json()
                  }).then(data => {
                    response = taskItem.message
                    state = 'performTask'
                    res.send({message: response, state: state})
                  })
              })
              }
              else {
                state = 'help'
                response = 'Invalid entry'
                res.send({message: response, state: state, repost: true}) 
              }
        break;
        case 'continuing':
          console.log('continuing')
          if(iMsg == 'no') {
            state = 'selectTask'
            fetch('http://localhost:3000/profiles/update/by-phone/', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  'activeTaskID': null,
                  'cellphone': iPhone
                  })
              }).then(res => {
                if (res.ok) return res.json()
              })
              .then(data => {
                response = 'active task cleared'
                state = 'help'
                 
                res.send({message: response, state: state, repost: true})
              })
          }
          else {
            console.log('yes!')
            state = 'performTask'
            fetch('http://localhost:3000/profiles/by-phone/' + iPhone + '/json', {
                method: 'get',
                headers: {'Content-Type': 'application/json'}
              }).then(res => {
                console.log(res)
                if (res.ok) return res.json()
                
              })
              .then(data => {
                fetch('http://localhost:3000/taskitem/by-id/' + data.profile[0].activeTaskID + '/json', {
                    method: 'get',
                    headers: {'Content-Type': 'application/json'},
                  }).then(res => {
                    if (res.ok) return res.json()
                  })
                  .then(task => {
                    console.log(task)
                    response = task.taskItem[0].message

                       if(task.taskItem[0].type.toLowerCase() === 'complete') {
                        state = "clearTask"
                        console.log("completed!")
                        repost = true
                      }
                      else {
                        repost = false
                      }

                    res.send({message: response, state: state, repost: repost})
                    
                  })
               
              })
          }
          
        break;

        case 'performTask':
             fetch('http://localhost:3000/profiles/performTask', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                  'taskResponse': iMsg,
                  'cellphone': iPhone,
                  })
              }).then(res => {
              
                if (res.ok) return res.json()
              })
              .then(data => {
                console.log(data.taskItem[0])
                console.log(data.taskItem[0].type)
                response = data.taskItem[0].message,
                state = 'performTask'
                  repost = false
                 if(data.taskItem[0].type.toLowerCase() === 'complete') {
                   state = "clearTask"
                   console.log("completed!")
                   repost = true
                 }
                
                res.send({message: response, state: state, repost: repost})
              })

        break;
        
        //setup profile
        case 'new_promptName':
          //call service to update profile with name
            res.send({message: response, state: state})
        break;
      }
    })   
})


app.post('/message', function (req, res){
  // See: https://www.twilio.com/docs/api/twiml/sms/twilio_request
  const from = req.body.From
  const body = req.body.Body
  client.sendMessage({
    to: from,
    from: '+13474640283',
    body: "Responding Back from rich"
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
