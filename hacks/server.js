const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
var db

MongoClient.connect('mongodb://localhost:27017/exampleDb', function (err, database) {
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
    console.log(results)
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

app.put('/quotes', (req, res) => {
  console.log('putting')

  db.collection('quotes')
  .findOneAndUpdate({name: 'Yoda'}, {
    $set: {
      name: req.body.name,
      quote: req.body.quote
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/quotes', (req, res) => {
  console.log('delete')
  db.collection('quotes').findOneAndDelete({name: req.body.name},
  (err, result) => {
    if (err) return res.send(500, err)
    res.json('ACKBAR FREED FROM TRAP')
  })
})

app.get('/quotes/by-name/:name', (req, res) => {
  console.log(req.params.name)

  db.collection('quotes').find({name: req.params.name}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('quotes.ejs', {name: req.params.name, quotes: result})
  })
})

app.get('/quotes/:id', (req, res) => {
  console.log(req.params.id)

  db.collection('quotes').find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('quote.ejs', {id: req.params.id, quotes: result})
  })
})
