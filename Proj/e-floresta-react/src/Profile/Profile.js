import  './Profile.css'
import ProfileImage from './profile_picture.png'
import TopBar from '../TopBar/TopBar.js'
import {Link} from "react-router-dom";
import { useState } from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";

const Profile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [nif, setNif] = useState("");
    const [type, setType] = useState("");
    const [state, setState] = useState("");


    let xmlhttp = new XMLHttpRequest();

    (function getValues() {
        console.log("teste");
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    setUsername(obj.username);
                    setEmail(obj.email)
                    setName(obj.name);
                    setPhone(obj.phone);
                    setNif(obj.nif);
                    setType(obj.type);
                    setState(obj.state);
                } else {
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/info/profileinfo");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    })()

    return(
        <>
            <CheckIfLoggedOut />
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