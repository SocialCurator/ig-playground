import express from 'express'
import bodyParser from 'body-parser'
import fs from 'fs'
import axios from 'axios';

// import localhost cert
const key = fs.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./localhost/localhost.crt');

const app = express()
const port = 4000

const https = require('https')
const server = https.createServer({ key, cert }, app);

// parse application/json
app.use(bodyParser.json())

// routes
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server')
})

app.post('/api/authorize', (req, res) => {
    console.log(1, req)
    res.json({ yourtoken: `sir!`, originalBody: req.body })
})

app.get('/getprofile', async (req, res) => {
    const uid = "165385175924266"
    const accessToken = "EAAKE4Xd4HZCQBAMiny6RuUHaOmFMZAdRqQonjipoqseDD856r3KFRtLyWLwDBNkjYPMxitVDdVF8FSeUlfqhHN5U489QZBMNFMyyqZAzgnl1KDjiTAZCW23E7wcegKZCgGS2pZACYQwrU937BzhioieNfNJ71dBa98fnAmkpQhWHa666UFiqVdbusnS6yx3nPPek1NgPf0RpnAQxkewVvA2"

    const url = `https://graph.facebook.com/v13.0/me?access_token=${accessToken}`
    console.log(url)
    try {
        const { data } = await axios({
            method: 'get',
            url
        })
        console.log('response from FB req', data)
    }
    catch (err) {
        console.log(err.message)
    }
})


// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`)
})
