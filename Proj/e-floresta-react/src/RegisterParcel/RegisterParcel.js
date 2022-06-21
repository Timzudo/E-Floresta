import TopBar from "../TopBar/TopBar.js"
import Map from "../Map/Map.js"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, { Component }  from 'react';

const RegisterParcel = () => {
    return(
        <>

        <CheckIfLoggedOut />
        <TopBar/>
            <div className="map_RegisterPortion">
                <Map/>
            </div>
        </>
    )
}

export default RegisterParcel