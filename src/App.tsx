import { useEffect } from 'react';
import { Link } from 'react-router-dom'
import useFacebook from './useFacebook';

const App = () => {

    const {
        user,
        loggedIn,
        actions: {
            initFacebookSdk,
            connectToFacebook,
            connectToInstagram,
            logoutWithFacebook,
            postToFacebook,
            postToInstagram,
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
            {loggedIn && user.facebook?.pages && (
                <>
                {
                    user.facebook.pages.map((page)=>{

                        return (
                            <>
                                <img src={page.profile.url} /><span>@{page.profile.name}</span>
                                {/* //TODO logout/disconnect from each individual account (or page?) */}
                                <button onClick={logoutWithFacebook}>Disconnect</button>
                                <button onClick={postToInstagram}>Post</button>
                                <br />
                            </>
                        )
                    })
                }
                </>
            )}
            {loggedIn && user.instagram?.pages && (
                <>
                    {
                        user.instagram.pages.map((page)=>{
                            return (
                                <>
                                    <img src={page.profile.url} /><span>@{page.profile.name}</span>
                                    {/* //TODO logout/disconnect from each individual account */}
                                    <button onClick={logoutWithFacebook}>Disconnect</button>
                                    <button onClick={postToInstagram}>Post</button>
                                    <br />
                                </>
                            )
                        })
                    }
                </>
            )}
                <h3>Add Channels</h3>
                <button onClick={connectToFacebook}>Connect your Facebook Account</button>
                <br />
                <br />
                <button onClick={connectToInstagram}>Connect your Instagram Account</button>
        </div>
    )
}

export default App
  