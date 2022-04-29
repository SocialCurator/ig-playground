const initFacebookSdk = () => {
    return new Promise((resolve) => {
        // wait for facebook sdk to initialize before starting the react app
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v8.0',
            })
        }

        window.FB.getLoginStatus((res) => {
            // statusChangeCallback(response)

            if (res.status === 'connected') {
                console.log(`i guess i'm logged in`)
                // The user is logged in and has authenticated our
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token 
                // and signed request each expire.

                // response looks like this
                // {
                //     status: 'connected',
                //     authResponse: {
                //         accessToken: '...',
                //         expiresIn:'...',
                //         signedRequest:'...',
                //         userID:'...'
                //     }
                // }

                var uid = res.authResponse.userID;
                var accessToken = res.authResponse.accessToken;
                console.log('uid', uid)
                console.log('accessToken', accessToken)
              } else if (res.status === 'not_authorized') {
                console.log(`I'm logged in but not authorized`)
                // The user hasn't authorized our application.  They
                // must click the Login button, or you must call FB.login
                // in response to a user gesture, to launch a login dialog.
              } else {
                console.log(`maybe I'm not logged in`)
                // The user isn't logged in to Facebook. You can launch a
                // login dialog with a user gesture, but the user may have
                // to log in to Facebook before authorizing our application.
              }
        // true -> refreshes cache of response object in the case that user
        // logs out of facebook or our app was removed from their settings
        // be careful about performance, should only run on initial page load
        }, true)  
    })
}

export default initFacebookSdk
