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

let user: UserData = {userID: 'social-curator-id'}

// TODO check if valid authentication for each account
// TODO refresh token for security?

// TODO store data for multiple FB + IG accounts
type UserData = {
    userID?: string,
    facebook?: AccountInfo,
    instagram?: AccountInfo
}

type AccountInfo = {
    auth?: {
        userID: string,
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
    },
    pages?: PageInfo
}

type PageInfo = {
    pageID: string,
    pageToken: string,
}

//------- functions
// get user's profile
const getProfile = async (token: string) => {
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        console.log('user profile', data)

        const profile = {
            name: data.name,
            first_name: data.first_name,
            picture: data.picture
        }

        return profile
    }
    catch (err) {
        console.log(err.message)
    }
}

// get data about pages that user authorized access to
const getPageInfo = async (token: string) => {
    const url = `https://graph.facebook.com/v13.0/me/accounts?access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        // array of objects containing information about each page
        console.log('response from FB req', data.data)

        const pageToken = data.data[0].access_token
        const pageID = data.data[0].id

        return {
            pageID,
            pageToken
        }
    }
    catch (err) {
        console.log(err.message)
    }
}

// post image to user's facebook page
const postImage = async (pageId, imageUrl, pageToken) => {
    const postUrl = `https://graph.facebook.com/${pageId}/photos?url=${imageUrl}&access_token=${pageToken}`

    const { data } = await axios({
        method: 'post',
        url: postUrl
    })
   
    console.log('response from FB post image req', data)

    return data.post_id
}

// update post with caption
const updatePost = async (postId, message, pageToken) => {
    const updateUrl = `https://graph.facebook.com/${postId}?message=${message}&access_token=${pageToken}`

    // update image with caption
    const { data } = await axios({
        method: 'post',
        url: updateUrl
    })

    console.log('response from FB update post req', data)

    return data
}

//------- routes (facebook)
app.get('/', (req, res) => {
    res.status(200).send('hi I am the server')
})

app.get('/user', (req, res) => {
    res.status(200).send(user)
})

// store token after login is complete
app.post('/authorize', async (req, res) => {
    const authResponse = req.body.authResponse
    const accessToken = authResponse.accessToken
    const userID = authResponse.userID

    //TODO validate auth token by checking with Facebook if it matches
    // check if auth token is valid

    const auth = {
        accessToken,
        userID
    }

    // get user's profile & page info
    const result = await Promise.all([getProfile(accessToken), getPageInfo(accessToken)])
    const profile = result[0]
    const pageInfo = result[1]
        
    // set user data
    user.facebook = {...user.facebook, auth, profile, pages: pageInfo}

    console.log("User's data has been stored in the server.")

    res.status(201).send(profile)
})

// post to user's facebook page
app.post('/post', async (req, res) => {

    console.log('post', req.body)

    const pageId = user.facebook.pages.pageID
    const pageToken = user.facebook.pages.pageToken
    const message = req.body.message
    const imageUrl = req.body.imageUrl

    try {
        // post image
        const postId = await postImage(pageId, imageUrl, pageToken)

        // update post with caption
        const data = await updatePost(postId, message, pageToken)

        res.send(data)
    }
    catch (err) {
        console.log(err.response)
    }
})

// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`)
})
