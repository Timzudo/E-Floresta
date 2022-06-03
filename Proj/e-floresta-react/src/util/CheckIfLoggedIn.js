const CheckIfLoggedIn = () => {

    let token = sessionStorage.getItem('token');
    if(token == null) {
        window.location.href = "/";
    }

    return(
        <></>
    )
}

export default CheckIfLoggedIn