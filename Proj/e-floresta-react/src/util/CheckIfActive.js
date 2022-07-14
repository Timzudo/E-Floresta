import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";
import {getAreaOfPolygon, getDistance, getPathLength} from "geolib";

const CheckIfActive = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        let state = localStorage.getItem('state');
        if(state == null){
            console.log("state null")
            localStorage.removeItem('token');
            navigate('/');
        }
        if(state !== 'ACTIVE') {
            console.log("nactive");
            //O utilizador nao tem uma conta ativa
            localStorage.removeItem('token');
            localStorage.removeItem('state');
            navigate('/wait-for-verif');
        }
    }, []);

    return(
        <></>
    )
}

export default CheckIfActive