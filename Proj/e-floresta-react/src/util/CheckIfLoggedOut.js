const CheckIfLoggedOut = () => {

    let token = localStorage.getItem('token');
    if(token == null) {
        //O utilizador nao tem um token valido, logo nao tem acesso as pags que precisam de login para lhes aceder
        window.location.href = "/";
    }

    return(
        <></>
    )
}

export default CheckIfLoggedOut