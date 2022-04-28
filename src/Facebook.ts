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

            // auto authenticate with the api if already logged in with facebook
            window.FB.getLoginStatus(({ authResponse }) => {
                if (authResponse) {
                    console.log(`i guess i'm logged in`)
                } else {
                    console.log(`maybe I'm not logged in`)
                }
            })
        }
    })
}

export default initFacebookSdk
