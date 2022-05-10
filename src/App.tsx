import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import useFacebook from './useFacebook';

const App = () => {

    const {
        user,
        loggedIn,
        actions: {
            initFacebookSdk,
            loginWithFacebook,
            logoutWithFacebook,
            postToFacebook,
            getUserData }
        } = useFacebook()

    // init Facebook Sdk on page load
    useEffect(()=>{
       initFacebookSdk()
    },[])

    const mainStyle = {
        fontFamily: 'sans-serif'
    }

    const boxStyle = {
        backgroundColor: 'lemonchiffon',
        padding: '30px',
        display: 'inline-block',
        borderRadius: '20px'
    }

    return (
        <div style={mainStyle}>
            <Link to="/other">Other</Link>
            <br />
            <br />
            <button onClick={getUserData}>Get User Data</button>
            <br />
            <h3>Connected Accounts</h3>
            {!loggedIn &&(
                <div style={boxStyle}>
                    It looks like you have no connected business account.
                </div>
            )}
            {loggedIn && user && (
                <>
                <img src={user.facebook?.picture?.data.url} /><span>@{user.facebook?.first_name}</span>
                <button onClick={logoutWithFacebook}>Disconnect</button>
                <button onClick={postToFacebook}>Post</button>
                </>
            )}
                <h3>Add Channels</h3>
                <button onClick={loginWithFacebook}>Connect your Facebook Account</button>
                <br />
                <br />
                // TODO auth process for IG
                <button disabled>Connect your Instagram Account</button>
        </div>
    )
}

export default App
