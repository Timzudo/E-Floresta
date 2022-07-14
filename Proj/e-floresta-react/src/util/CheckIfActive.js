import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";
import {getAreaOfPolygon, getDistance, getPathLength} from "geolib";

const CheckIfActive = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        let state = localStorage.getItem('state');
        if(state !== 'ACTIVE') {
            //O utilizador nao tem uma conta ativa
            console.log("Not active")
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