import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import useFacebook from './useFacebook';

const App = () => {

    const { user, loggedIn, actions: { initFacebookSdk, checkLoginState, loginWithFacebook, logoutWithFacebook } } = useFacebook()

    // init Facebook Sdk on page load
    useEffect(()=>{
       initFacebookSdk()
    },[])

    return (
        <>
            <Link to="/other">Other</Link>
            <br /><br />
            <div>Hello World</div>
            <br />
            {!loggedIn && (
                <button onClick={loginWithFacebook}>Login with Facebook</button>
            )}
            {loggedIn && (
                <button onClick={logoutWithFacebook}>Logout of Facebook</button>
            )}
        </>
    )
}

export default App
