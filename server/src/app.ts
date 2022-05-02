import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'

// import localhost cert
const key = fs.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./localhost/localhost.crt');

// init app
const app = express()
const port = 4000

// init server
const https = require('https')
const server = https.createServer({ key, cert }, app);

// parse application/json
app.use(bodyParser.json())

// routes
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server')
})

app.post('/api/authorize', (req, res) => {
    console.log(req.body)
    res.json({ yourtoken: `sir!`, originalBody: req.body })
})

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`)
})

// server.listen(port, () => {
//     return console.log(`Express is listening at https://localhost:${port}`)
// })
