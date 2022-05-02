import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import initFacebookSdk from './Facebook';

const App = () => {
    const loginWithFacebook = async () => {
          //https://developers.facebook.com/docs/facebook-login/web/
          window.FB.login( ({ authResponse }) => {
            if (authResponse) {
                console.log(authResponse)

                try {
                    const res = fetch(`/api/authorize`, {
                        method: 'POST',
                        body: authResponse.accessToken,
                    }).then(()=>{

                    })
                }
                catch (err) {
                    console.log(err)
                }
      
            } else {
                console.log(`no auth response`)
            }
        })
        // console.log(await res.json())
    }

    // on page load, auto authenticate with the api if already logged in with facebook
    useEffect(()=>{
       initFacebookSdk()
    },[])

    return (
        <>
            <div>hello world</div>
            <br />
            <button onClick={loginWithFacebook}>Login with Facebook</button>
            <br />
            <Link to="/other">Other</Link>
        </>
    )
}

export default App
