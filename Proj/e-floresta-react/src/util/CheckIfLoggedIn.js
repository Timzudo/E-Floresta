import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";

const CheckIfLoggedIn = () => {
    const navigate = useNavigate();
    let token = localStorage.getItem('token');
    if(token != null) {
        //O utilizador saiu da pag sem fazer logout e ainda tem um token valido, logo nao precisa de fazer login novamente
        navigate("/homepage");
    }

    return(
        <></>
    )
}

export default CheckIfLoggedIn