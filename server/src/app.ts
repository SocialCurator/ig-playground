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
        token?: string,
    },
    profile: {
        name: string,
        firstName?: string,
        username?: string,
        url: string
    },
    pages?: AccountInfo[]
}

let user: UserData = {id: 'social-curator-id'}

//------- functions
// get user's facebook account profile
const getFacebookProfile = async (token: string) => {
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
const getFacebookPages = async (token: string) => {
    const url = `https://graph.facebook.com/v13.0/me/accounts?fields=picture,name,access_token&access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        if (!data) {
            return
        }

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
        console.log(err.response)
    }
}

const getInstagramId = async (id: string, token: string) => {

    const url = `https://graph.facebook.com/v13.0/${id}?fields=instagram_business_account&access_token=${token}`

    try {
        const {data} = await axios({
            method: 'get',
            url
        })

        return data.instagram_business_account.id
    }
    catch (err) {
        console.log(err.message)
    }
}


const getInstagramProfile = async(id: string, token: string) => {

    const url=`https://graph.facebook.com/v13.0/${id}?fields=name,profile_picture_url,username&access_token=${token}`

    try {
        const { data } = await axios({
            method: 'get',
            url
        })

        const profile = {
            username: data.username,
            url: data.profile_picture_url
        }

        return profile
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
app.post('/facebook/authorization', async (req, res) => {
    const authResponse = req.body.authResponse
    const token = authResponse.accessToken
    const id = authResponse.userID

    const auth = {
        token,
        id
    }

    // get user's profile & page info
    const result = await Promise.all([getFacebookProfile(token), getFacebookPages(token)])

    const profile = result[0]
    const facebookPages = result[1]  

    let instagramPages = []

    // iterate through page info and get instagram id for each. store each id
    for (let i = 0; i < facebookPages.length; i++) {

        const id = facebookPages[i].auth.id
        const token = facebookPages[i].auth.token

        const instagramId = await getInstagramId(id,token)
        const instagramProfile = await getInstagramProfile(instagramId, token)

        instagramPages.push({
                            auth: {id: instagramId},
                            profile: instagramProfile
                        })  
    }

    user.facebook = {...user.facebook, auth, profile, pages: facebookPages}
    user.instagram = {...user.instagram, pages: instagramPages}

    const fbPages = facebookPages.map((page)=>{
       return {
                id: page.auth.id,
                profile: page.profile
            }
        })
    
    const igPages = instagramPages.map((page)=>{
            return {
                id: page.auth.id,
                profile: page.profile
            }
        })

    res.status(201).send({profile, facebookPages: fbPages, instagramPages: igPages})

})

// post image to user's facebook page
const postImage = async (pageId, imageUrl, pageToken) => {
    const postUrl = `https://graph.facebook.com/${pageId}/photos?url=${imageUrl}&access_token=${pageToken}`

    const { data } = await axios({
        method: 'post',
        url: postUrl
    })
   
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

    return data
}

// post to user's facebook page
app.post('/facebook/publish', async (req, res) => {

    const message = req.body.message
    const imageUrl = req.body.imageUrl
    const pageId = req.body.pageId

    const pageToken = user.facebook.pages[0].auth.token // TODO get token for that page


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

    const igUserId = req.body.userId
    const imageUrl = req.body.imageUrl
    const caption = req.body.caption
    const accessToken = user.facebook.pages[0].auth.token // TODO get token for that page


    try {
        // create IG media container (for single images)
        const res = await axios.post(`https://graph.facebook.com/v13.0/${igUserId}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`)
        // &location_id={location-id}
        // &user_tags={user-tags}

        const creationId = res.data.id

        // publish media container
        await axios.post(`https://graph.facebook.com/v13.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`)
    }
    catch (err) {
        console.log(err.response)
    }
})

// init server
server.listen(port, () => {
    return console.log(`Express is listening at https://localhost:${port}`)
})
