import axios from 'axios';
import { useState } from 'react';

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

type UserData = {
  userId?: string,
  facebook?: AccountInfo,
  instagram?: AccountInfo
}

const useFacebook = () => {

  const [user, setUser] = useState<UserData>({userId: '1234'})
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
        }
    })
  } 

  const loginWithFacebook = async () => {
    //https://developers.facebook.com/docs/facebook-login/web/
    window.FB.login( ({ authResponse }) => {

      if (authResponse) {
        setLoggedIn(true)
        console.log('auth response:', authResponse)

        const storeToken = axios.post('/authorize', {
          authResponse
        })
        const getProfile = axios.get<AccountInfo>('/getprofile')
         
        try { 
          axios.all([storeToken, getProfile]).then(axios.spread((...responses)=>{
           const fbProfile: AccountInfo = responses[1].data

           console.log('fbprofile', fbProfile)

           setUser({...user, facebook: fbProfile })
          })).catch(err => {
            console.log(err)
          })
        }
        catch (err) {
              console.log('you are here',err)
        }    
      } else {
          return console.log(`no auth response: user cancelled login or did not fully authorize`)
      }
      // TODO ask for additional permissions
    }, {scope: 'public_profile'})
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

  const getToken = async() => {
    const token = await (await axios.get('/token')).data
    console.log(token)
    return token
  }

  return {
    user,
    loggedIn,
    actions: {
      initFacebookSdk,
      loginWithFacebook,
      logoutWithFacebook,
      getToken
    }
  }
}

export default useFacebook


// const statusChangeCallback = (res: fb.StatusResponse) => {
//     console.log('checkLoginState res', res);

//     if (res.status === 'connected') {
//       console.log(`i guess i'm logged in`)
//       console.log('logged into facebook and into webpage')

//       setLoggedIn(true)

//       var uid = res.authResponse.userID;
//       var accessToken = res.authResponse.accessToken;

//       // redirect to app's logged in experience

//       // console.log('Welcome!  Fetching your information.... ');
//       // FB.api('/me', function(response) {
//       //   console.log('Successful login for: ' + response.name);
//       //   document.getElementById('status').innerHTML =
//       //     'Thanks for logging in, ' + response.name + '!';
//       // });

//     } else if (res.status === 'not_authorized') {
//       console.log('logged into facebook but not webpage')
//     }
//     else {
//       console.log(`maybe I'm not logged in`)
//       console.log('not logged into facebook')

//       setLoggedIn(false)

//       // prompt to log in OR show log in button
//     }
// }

// check user's log in status
// const checkLoginState = () => {
//   window.FB.getLoginStatus((res) => {
//     statusChangeCallback(res)
// }, true) // true: refreshes cache of response object in the case that user logs out of facebook or our app was removed from their settings be careful about performance, should only run on initial page load
// }           