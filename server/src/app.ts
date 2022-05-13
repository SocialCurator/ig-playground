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

type UserData = {
    id: string,
    facebook?: AccountInfo,
    instagram?: AccountInfo
}

type AccountInfo = {
    auth?: {
        id: string,
        token: string,
    },
    profile: {
        name: string,
        firstName?: string,
        url: string
    },
    pages?: AccountInfo[]
}

let user: UserData = {id: 'social-curator-id'}

//------- functions
// get user's profile
const getProfile = async (token: string) => {
    const url = `https://graph.facebook.com/v13.0/me?fields=id,name,first_name,picture&access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        const profile = {
            name: data.name,
            firstName: data.first_name,
            url: data.picture.data.url
        }

        return profile
    }
    catch (err) {
        console.log(err.message)
    }
}

// get data about pages that user authorized access to
// ? Note that in some cases the app User may grant your app access to more than one Page, in which case you should capture each Page ID and its respective token, and provide a way for the app User to target each of those Pages.
const getPageInfo = async (token: string) => {
    const url = `https://graph.facebook.com/v13.0/me/accounts?fields=picture,name,access_token&access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        const pagesInfo = data.data
        const pages = []

        pagesInfo.forEach((page)=>{
            const pageInfo = {
                auth: {
                    id: page.id,
                    token: page.access_token
                },
                profile: {
                    name: page?.name,
                    url: page?.picture.data.url
                }
            }
            pages.push(pageInfo)
        })
        
        return pages
    }
    catch (err) {
        console.log(err.message)
    }
}

//------- routes (facebook)

app.get('/user', (req, res) => {
    res.status(200).send(user)
})

// store token after login is complete
app.post('/authorization', async (req, res) => {
    const authResponse = req.body.authResponse
    const token = authResponse.accessToken
    const id = authResponse.userID

    const auth = {
        token,
        id
    }

    // get user's profile & page info
    const result = await Promise.all([getProfile(token), getPageInfo(token)])
    const profile = result[0]
    const pageInfo = result[1]

    // set user data
    if (req.body.type === 'facebook') {
        user.facebook = {...user.facebook, auth, profile, pages: pageInfo}
    }

    if (req.body.type === 'instagram') {
        user.instagram = {...user.instagram, auth, profile, pages: pageInfo}
    }

    res.status(201).send({profile, pageInfo})
})

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

// post to user's facebook page
app.post('/facebook/publish', async (req, res) => {

    console.log('post to facebook', req.body)

    const pageId = user.facebook.pages[0].auth.id
    const pageToken = user.facebook.pages[0].auth.token
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

// post to instagram page
app.post('/instagram/publish', async (req, res) => {

    // TODO
    const accountId = user.instagram.auth.userID
    const userId = user.instagram.pages.pageID
    const accessToken = user.instagram.pages.pageToken
    const caption = req.body.caption
    const imageUrl = req.body.imageUrl

    try {
        // create IG media container (for images)
        const creationId = await axios.post(`https://graph.facebook.com/v13.0/${accountId}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`)
        // &location_id={location-id}
        // &user_tags={user-tags}

        // publish media container
        await axios.post(`https://graph.facebook.com/v13.0/${userId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`)
    }
    catch (err) {
        console.log(err.response)
    }
})

// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`)
})
