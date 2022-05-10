import axios from 'axios';
import { useEffect, useState } from 'react';

type UserData = {
  userId?: string,
  facebook?: AccountInfo,
  instagram?: AccountInfo
}

type AccountInfo = {
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

const useFacebook = () => {
  const [user, setUser] = useState<UserData>({userId: '1234'})
  const [loggedIn, setLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // asynchronously load SDK into app
  const initFacebookSdk = () => {
    return new Promise((resolve) => {
        // wait for facebook sdk to initialize before starting the react app
        window.fbAsyncInit = () => {
            window.FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v8.0',
            })

            setIsInitialized(true)
        }
    })
  } 

  const loginWithFacebook = async () => {
    //https://developers.facebook.com/docs/facebook-login/web/
    window.FB.login( ({ authResponse }) => {

      if (authResponse) {
        setLoggedIn(true)
         
        try { 
          axios.post('/authorize', {
            authResponse
          }).then((res)=>{
            console.log(res.data)
            setUser({...user, facebook: res.data} )
          })
        }
        catch (err) {
          console.log('you are here',err)
        }    
      } else {
          return console.log(`no auth response: user cancelled login or did not fully authorize`)
      }
    }, {
      scope: 'public_profile,pages_show_list,pages_manage_posts,pages_read_engagement',
      return_scopes: true,
      enable_profile_selector: true
    })
  }

  const logoutWithFacebook = async () => {
    window.FB.logout((res) => {
      if (res.status === 'unknown') {
        console.log('user is now logged out')
        setLoggedIn(false)
      } else {
        alert('log out failed')
      }
    });
  }

  const postToFacebook = async () => {
    // TODO captions with special characters + white space?
    const message = 'testingtestingtesting'
    const imageUrl = 'https://www.seekpng.com/png/detail/3-39494_vector-cloud-png-white-clouds-vector-png.png'

    try {
      const res = await axios.post('/post', {message, imageUrl})
      console.log(res.data)
    }
    catch(err) {
      console.log(err)
    }
  }

  // for testing only
  const getUserData = async () => {
    try {
      const res = await axios.get('/user')
      console.log(res.data)
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
            axios.post('/authorize', {
              authResponse
            }).then((res)=>{
              console.log(res.data)
              setUser({...user, facebook: res.data} )
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
      loginWithFacebook,
      logoutWithFacebook,
      postToFacebook,
      getUserData
    }
  }
}

export default useFacebook