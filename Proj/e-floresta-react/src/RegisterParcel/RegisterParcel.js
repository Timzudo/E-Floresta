import TopBar from "../TopBar/TopBar.js"
import Map from "../Map/Map.js"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, { Component }  from 'react';
import CheckIfActive from "../util/CheckIfActive";

const RegisterParcel = () => {
    return(
        <>

        <CheckIfLoggedOut />
        <CheckIfActive />
        <TopBar/>
            <div className="map_RegisterPortion">
                <Map/>
            </div>
        </>
    )
}

export default RegisterParcel