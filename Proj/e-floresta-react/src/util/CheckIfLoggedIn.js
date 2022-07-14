import React, { Component }  from 'react';
import {useNavigate} from "react-router-dom";

const CheckIfLoggedIn = () => {
    const navigate = useNavigate();


    React.useEffect(() => {
        let token = localStorage.getItem('token');
        let role = localStorage.getItem('role');
        let state = localStorage.getItem('state');
        if(token != null && role != null && state != null) {
            console.log("login")
            //O utilizador saiu da pag sem fazer logout e ainda tem um token valido, logo nao precisa de fazer login novamente
            navigate("/homepage");
        }
    }, []);


    return(
        <></>
    )
}

export default CheckIfLoggedIn