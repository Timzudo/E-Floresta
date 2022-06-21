import React, { Component }  from 'react';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";


const LoggedHomepage = () => {

    return(<>
        <CheckIfLoggedOut />
        <TopBar />
    </>)
}