import  './Profile.css'
import ProfileImage from './profile_picture.png'
import TopBar from '../TopBar/TopBar.js'
import {Link} from "react-router-dom";

const Profile = () => {

    let username, email, name, phone, nif, type

    let xmlhttp = new XMLHttpRequest();

    function getValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    username = obj.username;
                    email = obj.email;
                    name = obj.name;
                    phone = obj.phone;
                    nif = obj.nif;
                    type = obj.type;
                } else {
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {tokenId:sessionStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/info/profileinfo");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return(
        <>
            <TopBar />

            <div className="profile_info">
                <img src={ProfileImage} alt="Profile picture" className="profile_pic"/>
                <p></p>
                <div id="username">
                    <p className="label">Username: {username}</p>
                </div>
                <div id="email">
                    <p className="label">E-mail: {email}</p>
                </div>
                <div id="name">
                    <p className="label">Nome Completo: {name}</p>
                </div>
                <div id="phone">
                    <p className="label">Telemóvel/Telefone: {phone}</p>
                </div>
                <div id="nif">
                    <p className="label">NIF: {nif}</p>
                </div>
                <div id="type">
                    <p className="label">Tipo de utilizador: {type}</p>
                </div>

                <div className="change-profile-info">
                    <Link to="/change-profile">
                        <button type="button" className="btn btn-secondary btn-sm">Editar Perfil</button>
                    </Link>
                </div>

            </div>

        </>

    )
}

export default Profile