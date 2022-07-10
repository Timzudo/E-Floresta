import  './Profile.css'
import ProfileImage from './profile_picture.png'
import TopBar from '../TopBar/TopBar.js'
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, {useEffect} from 'react'

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [nif, setNif] = useState("");
    const [type, setType] = useState("");
    const [state, setState] = useState(""); //TODO: ver se e preciso
    const [grade, setGrade] = useState("");


    let xmlhttp = new XMLHttpRequest();

    //Permite correr a funcao quando a pagina e carregada
    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    setUsername(obj.username);
                    setEmail(obj.email)
                    setName(obj.name);
                    setPhone(obj.phone);
                    setNif(obj.nif);
                    setType(obj.type);
                    setState(obj.state);
                    setGrade(obj.grade);
                } else if(xmlhttp.status == 403 ||xmlhttp.status == 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                }
                else {
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/info/profileinfo");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])

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
                    <p className="label">Telemóvel/Telefone: {phone===""? "Indefinido":phone}</p>
                </div>
                <div id="nif">
                    <p className="label">NIF: {nif===""? "Indefinido":nif}</p>
                </div>
                <div id="grade">
                    <p className="label">Nota: {grade}</p>
                </div>
                <div id="state">
                    <p className="label">Estado: {state === "ACTIVE"?"Ativo":"Inativo"}</p>
                </div>
                <div id="type">
                    <p className="label">Tipo de utilizador: {type}</p>
                </div>

                <div className="btn-group" id="change-profile-info">
                    <div id="changeProfileInfo_Profile">
                        <Link to="/change-profile">
                            <button type="button" className="btn btn-secondary btn-sm">Editar Perfil</button>
                        </Link>
                    </div>

                    <div id="changePassword_Profile">
                        <button onClick={ () => navigate("/change-password?id="+username)} type="button" className="btn btn-warning btn-sm">Alterar Palavra-Passe</button>
                    </div>

                </div>

            </div>

        </>

    )
}

export default Profile