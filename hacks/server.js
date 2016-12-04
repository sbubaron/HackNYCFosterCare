const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID



var db

MongoClient.connect('mongodb://mongouser:password@ds119788.mlab.com:19788/hacknycfostercare', function (err, database) {
  if (err) {
    return console.log(err)
  }

  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('view engine', 'ejs')


app.get('/', function (req, res) {
  // var cursor = db.collection('quotes').find()
  db.collection('profiles').find().toArray(function (err, results) {
    if (err) {
      console.log(err)
    }    
    res.render('index.ejs', {profiles: results})
  // send HTML file populated with quotes here
  })
})

app.post('/profiles', (req, res) => {
  console.log(req.body)
  // Train yourself to let go of everything you fear to lose

  db.collection('profiles').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved profile to database')
    res.redirect('/')
  })
})

app.get('/profiles/by-interests/:interest', (req, res) => {
  console.log(req.params.interest)

  db.collection('profiles').find({interests: req.params.interest}).toArray((err, result) => {
    if (err) return console.log(err)
    console.log(result)
    res.render('profiles.ejs', {interest: req.params.interest, profiles: result})
  })
})

app.get('/profiles/by-id/:id', (req, res) => {
  console.log(req.params.id)

  db.collection('profiles').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('profile.ejs', {profile: result})
  })
})

app.get('/profiles/by-phone/:phone', (req, res) => {
  db.collection('profiles').find({cellphone: req.params.phone}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('profile.ejs', {profile: result})
  })
})

app.get('/profiles/by-phone/:phone/json', (req, res) => {
  db.collection('profiles').find({cellphone: req.params.phone}).toArray((err, result) => {
    if (err) return console.log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({id: req.params.id, profile: result}, null, 3))
  })
})

app.delete('/profiles/delete/by-id/', (req, res) => {
  console.log('request to delete ' + req.body.id)

  db.collection('profiles').findOneAndDelete({_id: ObjectID(req.body.id)},
  (err, result) => {
    if (err) return res.send(500, err)
    res.json({deleted: true})
  })
})

app.put('/profiles/update/by-id/', (req, res) => {
  console.log('updating profile' + req.body.id)

  var prof = Object()

  if (req.body.dob) {
    prof.dob = req.body.dob
  }

  if (req.body.name) {
    prof.name = req.body.name
  }

  if (req.body.cellphone) {
    prof.cellphone = req.body.cellphone
  }

  if (req.body.interests) {
    prof.interests = req.body.interests
  }

  db.collection('profiles')
  .findOneAndUpdate({_id: ObjectID(req.body.id)}, {
    $set: prof
  }, {
    sort: {_id: -1},
    upsert: false
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})



app.get('/profiles/by-id/:id/json', (req, res) => {
  console.log(req.params.id)

  db.collection('profiles').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
    if (err) return console.log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({id: req.params.id, profile: result}, null, 3))
  })
})


app.get('/tasks', function (req, res) {
  // var cursor = db.collection('quotes').find()
  db.collection('tasks').find().toArray(function (err, results) {
    if (err) {
      console.log(err)
    }
    console.log(results)
    res.render('tasks.ejs', {tasks: results})
  // send HTML file populated with quotes here
  })
})

app.post('/tasks', (req, res) => {
  console.log(req.body)
  // Train yourself to let go of everything you fear to lose

  db.collection('tasks').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved task to database')
    res.redirect('/tasks')
  })
})


app.get('/tasks/by-id/:id', (req, res) => {
  console.log(req.params.id)
  

  db.collection('tasks').find({_id: ObjectID(req.params.id)}).toArray((err, taskRes) => {
    if (err) return console.log(err)
    console.log(taskRes)
    res.render('task.ejs', {task: taskRes, items: []})
  })
/*
  db.collection('taskitems').find({taskId: ObjectID(req.params.id)}).toArray((err, taskitems) => {
    if (err) return console.log(err2)

    items = taskitems
  })*/
  //console.log(task)
  
})
