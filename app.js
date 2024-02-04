const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server Running At http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error Occured:${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//Getting List Of Players
app.get('/players/', async (request, response) => {
  const getQuery = `
  SELECT * FROM cricket_team ;
  `
  const playerslist = await db.all(getQuery)
  response.send(
    playerslist.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
//Posting new Player
app.post('/players/', async (request, response) => {
  const newPlayer = request.body
  const {playerName, jerseyNumber, role} = newPlayer
  const insertQuery = `
INSERT INTO cricket_team( player_name ,jersey_number ,role)
values(
  '${playerName}',
  ${jerseyNumber},
  '${role}'
);
`
  await db.run(insertQuery)
  response.send('Player Added to Team')
})
//Getting one Player
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
  SELECT * FROM cricket_team 
  WHERE player_id=${playerId};
  `
  const player = await db.get(getQuery)
  response.send(convertDbObjectToResponseObject(player))
})
//Updating a player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const newPlayer = request.body
  const {playerName, jerseyNumber, role} = newPlayer
  const updateQuery = `
update cricket_team
set 
  player_name='${playerName}',
 jersey_number= ${jerseyNumber},
  role='${role}'
  where player_id=${playerId};
`
  await db.run(updateQuery)
  response.send('Player Details Updated')
})
//Deleteing a Player Details
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
   DELETE  FROM cricket_team 
   WHERE player_id=${playerId};
   `
  await db.run(deleteQuery)
  response.send('Player Removed')
})
module.exports = app
