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
            logoutWithFacebook,
            postToFacebook,
            postToInstagram,
            getUserDataBE,
            getUserDataFE }
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
            <button onClick={getUserDataBE}>Get User Data BE</button><button onClick={getUserDataFE}>Get User Data FE</button>

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
                            <div key={page.id}>
                                <img src={page.profile?.url} /><span>@{page.profile?.name}</span>
                                <button onClick={logoutWithFacebook}>Disconnect</button>
                                <button onClick={()=>postToFacebook(page.id)}>Post</button>
                                <br />
                            </div>
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
                                <div key={page.id}>
                                    <img src={page.profile?.url} /><span>@{page.profile?.username}</span>
                                    <button onClick={logoutWithFacebook}>Disconnect</button>
                                    <button onClick={()=>postToInstagram(page.id)}>Post</button>
                                    <br />
                                </div>
                            )
                        })
                    }
                </>
            )}
                <h3>Add Channels</h3>
                <button onClick={connectToFacebook}>Connect your Facebook Account</button>
                <br />
                <br />
                <button onClick={connectToFacebook}>Connect your Instagram Account</button>
        </div>
    )
}

export default App
  