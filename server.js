const sqlite = require('sqlite')
const express = require('express')
const Promise = require('bluebird')
const bodyParser = require('body-parser')
const usersSeed = require('./public/members.json')
const app = express()
let db

app.use(express.static('public'))
app.use(bodyParser.json())

const insertMember = m => {
  const { name, nickname, email, password } = m
  return db.get('INSERT INTO members(name, nickname, email, password) VALUES(?, ?, ?, ?)', name, nickname, email, password)
  .then(() => db.get('SELECT last_insert_rowid() as id'))
  .then(({ id }) => db.get('SELECT * from members WHERE id = ?', id))
}
// code qui remplit la db exemple
const dbPromise = Promise.resolve()
.then(() => sqlite.open('./database.sqlite', { Promise }))
.then(_db => {
  db = _db
  return db.migrate({ force: 'last' })
})
.then(() => Promise.map(usersSeed, m => insertMember(m)))



const html = `
<!doctype html>
<html class="no-js" lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Mario Kart Contest</title>
    <link rel="icon" type="image" href="favicon.ico"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">  
  </head>
  <body>
    <div id="main">
    </div>
  <script src="/page.js"></script>
  <script src="/app.js"></script>
  </body>
</html>`

app.get('/members', (req, res) => {
  db.all('SELECT * from members')
  .then(records => {
    return res.json(records)
  })
})

/*app.get('/members', (req, res) => {
  const members = [
    {
      name : "Ana",
      nickname : "Ere",
      //preferredCharacter : "Yoshi",
      email: "anahita.vahdani@neuf.fr",
      password:"motdepasse"
    },
    {
      name : "Dorian",
      nickname : "Cynnah",
      //preferredCharacter : "Toad"
      email: "anahita.vahdani@neuf.fr",
      password:"motdepasse"
    },
    {
      name : "Khalid",
      nickname : "Ere",
      email: "anahita.vahdani@neuf.fr",
     // preferredCharacter : "Yoshi"
     password:"motdepasse"
    },
    {
      name : "Anthony",
      nickname : "Elmoro",
      email: "anahita.vahdani@neuf.fr",
     // preferredCharacter : "Luigi"
     password:"motdepasse"
    } 
  ]
  res.json(members)
})

*/

//CREATE
app.post('/members', (req, res) => {
  return insertMember(req.body)
  .then(record => res.json(record))
})

//READ
app.get('*', (req, res) => {
  res.send(html)
  res.end()
})

app.listen(3000)
