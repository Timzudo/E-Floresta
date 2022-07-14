import React, {Component, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import {getAreaOfPolygon, getDistance, getPathLength} from "geolib";

const CheckIfLoggedOut = () => {
    const navigate = useNavigate();


    React.useEffect(() => {
        let token = localStorage.getItem('token');
        let role = localStorage.getItem('role');
        let state = localStorage.getItem('state');
        if(token == null || role == null || state == null) {
            console.log("logout")
            //O utilizador nao tem um token valido, logo nao tem acesso as pags que precisam de login para lhes aceder
            navigate('/');}
    }, []);

    return(
        <></>
    )
}

export default CheckIfLoggedOut