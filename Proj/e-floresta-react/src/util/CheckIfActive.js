import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";

const CheckIfActive = () => {
    const navigate = useNavigate();
    let state = localStorage.getItem('state');
    if(state !== 'ACTIVE') {
        //O utilizador nao tem uma conta ativa
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('state');
        navigate('/wait-for-verif');
    }

    return(
        <></>
    )
}

export default CheckIfActive