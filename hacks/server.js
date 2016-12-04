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

app.put('/profiles/update/by-phone/', (req, res) => {
  console.log('updating profile by phone' + req.body.cellphone)

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

  if (req.body.activeTaskID) {
    prof.activeTaskID = req.body.activeTaskID
  }
  else if (req.body.activeTaskID === null) {
    prof.activeTaskID = ''
  }

  db.collection('profiles')
  .findOneAndUpdate({cellphone: req.body.cellphone}, {
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


app.get('/taskitem/by-id/:id/json', (req, res) => {
  console.log(req.params.id)

  db.collection('taskItems').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
    if (err) return console.log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({taskItem: result}, null, 3))
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


app.get('/tasks/json', function (req, res) {
  // var cursor = db.collection('quotes').find()
  db.collection('tasks').find().toArray(function (err, results) {
    if (err) {
      console.log(err)
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({tasks: results}, null, 3))
  })
})


app.get('/tasks/by-trigger/:trigger/taskitem/json', function (req, res) {
  // var cursor = db.collection('quotes').find()
  console.log(req.params.trigger)

  db.collection('tasks').findOne({trigger: req.params.trigger},
  (err, results) => {
    if (err) {
      console.log(err)
    }
    console.log(results)
    var idStr = results._id + ''

    db.collection('taskItems').find({parentTaskId: idStr}).sort({index: 1}).limit(1).toArray(
    (err2, taskItem) => {
      if (err2) {
        console.log(err2)
      }
              res.setHeader('Content-Type', 'application/json')
              res.send(JSON.stringify({task: results, taskItem: taskItem}, null, 3))
    })
  })
})

app.post('/profiles/performTask', (req, res) => {
    console.log(req.body)

    db.collection('profiles').findOne({cellphone: req.body.cellphone},
    (err, profile) => {
      if(err) console.log(err)

      var profTask = new Object();
      profTask.profileId = profile._id
      profTask.taskId = profile.activeTaskID
      profTask.userResponse = req.body.taskResponse

      db.collection('profileTasks').save(profTask, (err, result) => {
      
        if (err) return console.log(err)
      
        console.log('saved profile task to database')
        console.log(profTask)


         db.collection('taskItems').findOne({_id: ObjectID(profTask.taskId)},
          (err2, curTaskItem) => {
            if (err2) {
              console.log(err2)
            }

            console.log(curTaskItem)
            console.log(curTaskItem.parentTaskId)
            console.log(curTaskItem.index)

              db.collection('taskItems').find({parentTaskId: curTaskItem.parentTaskId, index: {$gt: curTaskItem.index}}).sort({index: 1}).limit(1).toArray(
                (err3, nextTaskItem) => {
                  if (err2) {
                    console.log(err2)
                  }

                  console.log(nextTaskItem)
                  console.log(nextTaskItem[0]._id)

                  db.collection('profiles')
                    .findOneAndUpdate({cellphone: req.body.cellphone}, {
                      $set: {activeTaskID: nextTaskItem[0]._id}
                    }, {
                      sort: {_id: -1},
                      upsert: false
                    }, (err, result) => {
                      if (err) return res.send(err)
                          res.setHeader('Content-Type', 'application/json')
                          res.send(JSON.stringify({taskItem: nextTaskItem}, null, 3))
                    })
                     
                }) //close nextTaskItem Query


          }) //close curTaskItem Query
        

      }) //close profileTasks Save
      
      
    }) //close first profile query

  
}) //close route



app.post('/tasks', (req, res) => {
  console.log(req.body)
  // Train yourself to let go of everything you fear to lose

  db.collection('tasks').save(req.body, (err, result) => {
    if (err) return console.log(err)

    console.log('saved task to database')
    res.redirect('/tasks')
  })
})

app.delete('/tasks/delete/by-id/', (req, res) => {
  console.log('request to delete task ' + req.body.id)

  db.collection('tasks').findOneAndDelete({_id: ObjectID(req.body.id)},
  (err, result) => {
    if (err) return res.send(500, err)
    res.json({deleted: true})
  })
})

app.get('/tasks/by-id/:id', (req, res) => {
  // console.log(req.params.id)

  db.collection('tasks').find({_id: ObjectID(req.params.id)}).toArray((err, taskRes) => {
    if (err) return console.log(err)
    //console.log(taskRes)

    db.collection('taskItems').find({parentTaskId: req.params.id}).toArray((err, taskItemsRes) => {
      if (err) return console.log(err)
      // console.log(taskItemsRes)

      res.render('task.ejs', {task: taskRes, items: taskItemsRes})
    })
  })
})

app.post('/tasks/by-id/:id/items', (req, res) => {
  console.log('attempting insert/update of taskitem')
  console.log(req.body)
  console.log(req.body._id)

  var id
  if(req.body._id) {
    id = ObjectID(req.body._id)
  }

  // Train yourself to let go of everything you fear to lose

/*  db.collection('taskItems').save(req.body, (err, result) => {
    if (err) return console.log(err)
    console.log(result)
    console.log('saved task item to database')
    console.log(req.body)
    res.redirect('/tasks/by-id/' + req.params.id)
  }) */


  db.collection('taskItems')
  .findOneAndUpdate({_id: ObjectID(id)}, {
    $set: {
      name: req.body.name,
      index: req.body.index,
      message: req.body.message,
      type: req.body.type,
      expectedInput: req.body.expectedInput,
      parentTaskId: req.body.parentTaskId
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.redirect('/tasks/by-id/' + req.body.parentTaskId )
  })
})


app.delete('/taskitems/delete/by-id/', (req, res) => {
  console.log('request to delete task item ' + req.body.id)

  db.collection('taskItems').findOneAndDelete({_id: ObjectID(req.body.id)},
  (err, result) => {
    if (err) return res.send(500, err)
    res.json({deleted: true})
  })
})

app.get('/taskitems/by-id/:id/json', (req, res) => {
  db.collection('taskItems').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
    if (err) return console.log(err)
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({taskItem: result}, null, 3))
  })
})