import React, { useState, useEffect } from 'react';

const useFacebook = () => {

  // ? this would be stored in UserContext
  const [user, setUser] = useState({})
  const [loggedIn, setLoggedIn] = useState(false)

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

            checkLoginState()
        }
    })
  }

// check user's log in status
// calling this when on landing pages is recommended
const checkLoginState = () => {
  window.FB.getLoginStatus((res) => {
    // statusChangeCallback(res)

    // response object
    //   {
    //     status: 'connected',
    //     authResponse: {
    //         accessToken: '...',
    //         expiresIn:'...',
    //         signedRequest:'...',
    //         userID:'...'
    //     }
    // }

    if (res.status === 'connected') {
        console.log(`i guess i'm logged in`)

        setLoggedIn(true)

        var uid = res.authResponse.userID;
        var accessToken = res.authResponse.accessToken;

        // redirect to app's logged in experience

      } else {
        console.log(`maybe I'm not logged in`)

        setLoggedIn(false)

        // prompt to log in OR show log in button
      }
  // true -> refreshes cache of response object in the case that user
  // logs out of facebook or our app was removed from their settings
  // be careful about performance, should only run on initial page load
  }, true)  
}

const loginWithFacebook = async () => {
  //https://developers.facebook.com/docs/facebook-login/web/
  window.FB.login( ({ authResponse }) => {
    if (authResponse) {
        console.log('auth response:', authResponse)

        setLoggedIn(true)

        try {
            fetch(`/api/authorize`, {
                method: 'POST',
                body: authResponse.accessToken,
            }).then((res)=>{
              console.log(res)
            })
        }
        catch (err) {
            console.log(err)
        }

    } else {
        console.log(`no auth response: user cancelled login or did not fully authorize`)
    }
    // TODO ask for additional permissions
}, {scope: 'public_profile'})
// console.log(await res.json())
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

  return {
    user,
    loggedIn,
    actions: {
      initFacebookSdk,
      checkLoginState,
      loginWithFacebook,
      logoutWithFacebook
    }
  }
}

export default useFacebook