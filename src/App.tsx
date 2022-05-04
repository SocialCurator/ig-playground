import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import useFacebook from './useFacebook';

const App = () => {

    const { user, loggedIn, actions: { initFacebookSdk, loginWithFacebook, logoutWithFacebook } } = useFacebook()

    // init Facebook Sdk on page load
    useEffect(()=>{
       initFacebookSdk()
    },[])

    const boxStyle = {
        backgroundColor: 'lightgrey',
        padding: '30px',
        display: 'inline-block'
    }

    return (
        <>
            <Link to="/other">Other</Link>
            <br />
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
                </>
            )}
                <h3>Add Channels</h3>
                <button onClick={loginWithFacebook}>Connect your Facebook Account</button>
        </>
    )
}

export default App
