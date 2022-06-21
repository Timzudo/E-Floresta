import TopBar from "../TopBar/TopBar.js"
import Map from "../Map/Map.js"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, { Component }  from 'react';

const RegisterParcel = () => {
    const { language } = this.props;
    
    return(
        <>

        <CheckIfLoggedOut />
        <TopBar/>
            <div className="map_RegisterPortion">
                <Map language={language}/>
            </div>
        </>
    )
}

export default RegisterParcel