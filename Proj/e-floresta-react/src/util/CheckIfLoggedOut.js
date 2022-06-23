import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";

const CheckIfLoggedOut = () => {
    const navigate = useNavigate();
    let token = localStorage.getItem('token');
    if(token == null) {
        //O utilizador nao tem um token valido, logo nao tem acesso as pags que precisam de login para lhes aceder
        navigate('/');
    }

    return(
        <></>
    )
}

export default CheckIfLoggedOut