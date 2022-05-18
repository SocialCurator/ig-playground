import axios from 'axios';
import { useEffect, useState } from 'react';

type UserData = {
  id?: string,
  facebook?: AccountInfo,
  instagram?: AccountInfo
}

type AccountInfo = {
  profile?: {
    name?: string,
    firstName?: string,
    url: string,
    username?: string
  },
  id?: string,
  pages?: AccountInfo[]
}

const useFacebook = () => {

  const [user, setUser] = useState<UserData>({id: 'social-curator-id'})
  const [loggedIn, setLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // asynchronously load SDK into app
  const initFacebookSdk = () => {
    return new Promise((resolve) => {
        // wait for facebook sdk to initialize before starting the react app
        window.fbAsyncInit = () => {
            FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v13.0',
            })
            setIsInitialized(true)
        }
    })
  } 

  const connectToFacebook = async () => {
    //https://developers.facebook.com/docs/facebook-login/web/
    window.FB.login( ({ authResponse }) => {

      if (authResponse) {
        setLoggedIn(true)
         
        try { 

          axios.post('/facebook/authorization', { authResponse }).then((res)=>{
            console.log("User's data has been stored in the server.")
            setUser({
              ...user,
              facebook: {...user.facebook, profile: res.data.profile, pages: res.data.facebookPages},
              instagram: {...user.instagram, pages: res.data.instagramPages}
            })
          })
        }
        catch (err) {
          console.log('you are here', err)
        }    
      } else {
          return console.log(`no auth response: user cancelled login or did not fully authorize`)
      }
    }, {
      scope: 'public_profile,pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish',
      return_scopes: true,
      enable_profile_selector: true
    })
  }


  const logoutWithFacebook = async () => {
    window.FB.logout((res) => {
      if (res.status === 'unknown') {
        console.log('user is now logged out')
        setLoggedIn(false)
        // TODO remove facebook in state and in db
      } else {
        alert('log out failed')
      }
    });
  }

  // TODO disconnect from pages + ig accounts individually

  const postToFacebook = async (pageId?: string) => {
    const message = 'testingtestingtesting' // TODO captions with special characters + white space
    const imageUrl = 'https://www.seekpng.com/png/detail/3-39494_vector-cloud-png-white-clouds-vector-png.png'

    try {
      const res = await axios.post('/facebook/publish', {message, imageUrl, pageId})
      console.log(res.data)
    }
    catch(err) {
      console.log(err)
    }
  }

  const postToInstagram = async (userId?: string) => {

    const caption = 'testing ig wooooo'
    const imageUrl = 'https://mlpxhq8ztvyc.i.optimole.com/QgmSm9c.1pLW~44a4f/w:350/h:350/q:100/https://thrivethemes.com/wp-content/uploads/2018/05/photo-jpeg-example.jpg'

    try {
      const res = await axios.post('/instagram/publish', {caption, imageUrl, userId})
      console.log(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }

  // ----- for testing only -----
  const getUserDataBE = async () => {
    try {
      const res = await axios.get('/user')
      console.log(res.data)
    }
    catch(err) {
      console.log(err)
    }
  }
  const getUserDataFE = async () => {
    try {
      console.log(user)
    }
    catch(err) {
      console.log(err)
    }
  }

  // once sdk is initialized, check if user is logged in
  useEffect(()=>{
    if (isInitialized) {
      window.FB.getLoginStatus((res) => {
        console.log(res)

        // user is logged in
        if (res.status === 'connected') {
          setLoggedIn(true)
          const authResponse = res.authResponse

          try { 
            axios.post('/facebook/authorization', {
              authResponse
            }).then((res)=>{
              setUser({
                ...user,
                facebook: {...user.facebook, profile: res.data.profile, pages: res.data.facebookPages},
                instagram: {...user.instagram, pages: res.data.instagramPages}
              })
            })
          }
          catch (err) {
            console.log('you are here',err)
          }    
        }
        // user is not logged in
        else {
          setLoggedIn(false)
        }
      }, true); // true: refreshes cache of response object in the case that user logs out of facebook or our app was removed from their settings be careful about performance, should only run on initial page load
    }
  }, [isInitialized])

  return {
    user,
    loggedIn,
    actions: {
      initFacebookSdk,
      connectToFacebook,
      logoutWithFacebook,
      postToFacebook,
      postToInstagram,
      getUserDataBE,
      getUserDataFE
    }
  }
}

export default useFacebook