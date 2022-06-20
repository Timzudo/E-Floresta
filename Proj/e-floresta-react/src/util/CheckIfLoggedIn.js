import React, { Component }  from 'react';

const CheckIfLoggedIn = () => {

    let token = localStorage.getItem('token');
    if(token != null) {
        //O utilizador saiu da pag sem fazer logout e ainda tem um token valido, logo nao precisa de fazer login novamente
        window.location.href = "/homepage";
    }

    return(
        <></>
    )
}

export default CheckIfLoggedIn