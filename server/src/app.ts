import express from 'express'
import fs from 'fs'
import axios from 'axios';
import https from 'https'

// import localhost cert
const key = fs.readFileSync('./localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./localhost/localhost.crt');

// init express
const app = express()
const port = 4000
const server = https.createServer({ key, cert }, app)

// parse application/json
app.use(express.urlencoded({extended: true}))
app.use(express.json())

// ------- simulate db
type AccountInfo = {
    auth?: {
        userId: string,
        accessToken: string,
    },
    profile?: {
        name?: string,
        first_name?: string,
        picture?: {
            data: {
                height: number,
                is_silhouette: boolean,
                url: string,
                width: number
            }
    }
    }
}

type UserData = {
    userId?: string,
    facebook?: AccountInfo,
    instagram?: AccountInfo
}

let user: UserData = {userId: 'social-curator-id'}

//------- routes (facebook)
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server')
})

// store token after login is complete
app.post('/authorize', (req, res) => {
    const authResponse = req.body.authResponse

    const fbAuth = {
        accessToken: authResponse.accessToken,
        userId: authResponse.userID
    }

    user.facebook = {...user.facebook, auth: fbAuth}

    res.status(201).send(`access token has been stored: ${authResponse.accessToken}`)
})

// get token
app.get('/token', (req,res)=>{
    res.status(200).send(user.facebook.auth.accessToken)
})

// get user's facebook profile
app.get('/getprofile', async (req, res) => {
    const accessToken = user.facebook.auth.accessToken
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${accessToken}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        console.log('response from FB req', data)

        const fbProfile = {
            name: data.name,
            first_name: data.first_name,
            picture: data.picture
        }

        user.facebook = {...user.facebook, profile: fbProfile}

        res.status(200).send(fbProfile)
    }
    catch (err) {
        console.log(err.message)
    }
})

// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`)
})
