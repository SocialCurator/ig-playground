import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import initFacebookSdk from './Facebook';

const App = () => {
    const loginWithFacebook = async () => {
        const accessToken = `rwrlkjl3kjr3lkjr2lkjlfwkjflkjflskjfdslkfjds`
        const res = await fetch(`/api/authorize`, {
            method: 'POST',
            body: accessToken,
        })
        console.log(await res.json())

        //https://developers.facebook.com/docs/facebook-login/web/
        /*
        window.FB.login( ({ authResponse }) => {
            if (authResponse) {
                console.log(authResponse)
            } else {
                console.log(`no auth response`)
            }
        })
        */
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
