import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import useFacebook from './useFacebook';

const App = () => {

    const { user, loggedIn, actions: { initFacebookSdk, loginWithFacebook, logoutWithFacebook } } = useFacebook()

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
            <br />
            {!loggedIn && (
                <>
                <h3>Connect your Facebook Account</h3>
                <button onClick={loginWithFacebook}>Log in with Facebook</button>
                </>
            )}
            {loggedIn && user && (
                <>
                <h3>Welcome, {user.facebook?.first_name}</h3>
                <img src={user.facebook?.picture?.data.url} />
                <button onClick={logoutWithFacebook}>Log out of Facebook</button>
                </>
            )}
        </>
    )
}

export default App
