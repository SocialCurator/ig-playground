import axios from 'axios';
import { useEffect, useState } from 'react';

type UserData = {
  id?: string,
  facebook?: AccountInfo,
  instagram?: AccountInfo
}

type AccountInfo = {
  profile: {
    name: string,
    firstName?: string,
    url: string,
  },
  pages?: AccountInfo[]
}

const useFacebook = () => {

  const [user, setUser] = useState<UserData>({id: '1234'})
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

  const connectToFacebook = async () => {
    //https://developers.facebook.com/docs/facebook-login/web/
    window.FB.login( ({ authResponse }) => {

      if (authResponse) {
        setLoggedIn(true)
         
        try { 
          axios.post('/authorization', {
            authResponse,
            type: 'facebook'
          }).then((res)=>{
            console.log("User's data has been stored in the server.")
            console.log('res', res.data)
            setUser({...user, facebook: {...user.facebook, profile: res.data.profile, pages: res.data.pageInfo}} )
          })
        }
        catch (err) {
          console.log('you are here', err)
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

  const connectToInstagram = async () => {
    window.FB.login( ({ authResponse }) => {

      if (authResponse) {
        setLoggedIn(true)
         
        try { 
          axios.post('/authorization', {
            authResponse,
            type: 'instagram'
          }).then((res)=>{
            console.log(res.data)
            setUser({...user, instagram: {...user.instagram, profile: res.data.profile, pages: res.data.pageInfo}} )
          })
        }
        catch (err) {
          console.log('you are here here', err)
        }    
      } else {
          return console.log(`no auth response: user cancelled login or did not fully authorize`)
      }
    }, {
      scope: 'instagram_basic,instagram_content_publish',
      return_scopes: true,
      enable_profile_selector: true
    })
  }

  const logoutWithFacebook = async () => {
    window.FB.logout((res) => {
      if (res.status === 'unknown') {
        console.log('user is now logged out')
        setLoggedIn(false)
        // TODO
        // remove facebook in state
      } else {
        alert('log out failed')
      }
    });
  }

  // const logoutWith Instagram = async () => {}

  const postToFacebook = async () => {
    // TODO captions with special characters + white space?
    const message = 'testingtestingtesting'
    const imageUrl = 'https://www.seekpng.com/png/detail/3-39494_vector-cloud-png-white-clouds-vector-png.png'

    try {
      const res = await axios.post('/facebook/publish', {message, imageUrl})
      console.log(res.data)
    }
    catch(err) {
      console.log(err)
    }
  }

  const postToInstagram = async () => {

    const caption = 'testing ig wooooo'
    const imageUrl = 'https://mlpxhq8ztvyc.i.optimole.com/QgmSm9c.1pLW~44a4f/w:350/h:350/q:100/https://thrivethemes.com/wp-content/uploads/2018/05/photo-jpeg-example.jpg'

    try {
      const res = await axios.post('/instagram/publish', {caption, imageUrl})
      console.log(res.data)
    }
    catch (err) {
      console.log(err)
    }
  }

  // ----- for testing only -----
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
  // useEffect(()=>{
  //   if (isInitialized) {
  //     window.FB.getLoginStatus((res) => {
  //       console.log(res)

  //       // user is logged in
  //       if (res.status === 'connected') {
  //         setLoggedIn(true)
  //         const authResponse = res.authResponse

  //         try { 
  //           axios.post('/authorize', {
  //             authResponse
  //           }).then((res)=>{
  //             console.log(res.data)
  //             setUser({...user, facebook: res.data} )
  //           })
  //         }
  //         catch (err) {
  //           console.log('you are here',err)
  //         }    
  //       }
  //       // user is not logged in
  //       else {
  //         setLoggedIn(false)
  //       }
  //     }, true); // true: refreshes cache of response object in the case that user logs out of facebook or our app was removed from their settings be careful about performance, should only run on initial page load
  //   }
  // }, [isInitialized])

  return {
    user,
    loggedIn,
    actions: {
      initFacebookSdk,
      connectToFacebook,
      connectToInstagram,
      logoutWithFacebook,
      postToFacebook,
      postToInstagram,
      getUserData
    }
  }
}

export default useFacebook