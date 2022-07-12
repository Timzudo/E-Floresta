import  './Profile.css'
import ProfileImage from './profile_picture.png'
import TopBar from '../TopBar/TopBar.js'
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, {useEffect} from 'react'
import {Badge} from "react-bootstrap";

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
                } else if(xmlhttp.status === 403 ||xmlhttp.status === 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                }
                else if(xmlhttp.status === 500) {
                    alert("Erro do sistema. Tente novamente mais tarde.");
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


    function userGrade(grade) {
        if(grade === 1) {
            return(
                <Badge className="badge_Profile" bg="danger">1</Badge>
            )
        }
        else if(grade === 2) {
            return(
                <Badge className="badge_Profile" id="badge-2_Profile" bg="warning">2</Badge>
            )
        }
        else if(grade === 3){
            return(
                <Badge className="badge_Profile" bg="info">3</Badge>
            )
        }
        else if(grade === 4){
            return(
                <Badge className="badge_Profile" bg="primary">4</Badge>
            )
        }
        else{
            return(
                <Badge className="badge_Profile" bg="success">5</Badge>
            )
        }
    }


    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_Profile">
                <div className="profile_info">
                    <img src={ProfileImage} alt="Profile picture" className="profile_pic"/>
                    <p></p>
                    <div id="username">
                        <p className="label_Profile"><b>Username: </b> {username}</p>
                    </div>
                    <div id="email">
                        <p className="label_Profile"><b>E-mail: </b> {email}</p>
                    </div>
                    <div id="name">
                        <p className="label_Profile"><b>Nome Completo: </b> {name}</p>
                    </div>
                    <div id="phone">
                        <p className="label_Profile"><b>Telemóvel/Telefone: </b> {phone===""? "Indefinido":phone}</p>
                    </div>
                    <div id="nif">
                        <p className="label_Profile"><b>NIF: </b> {nif===""? "Indefinido":nif}</p>
                    </div>
                    <div id="grade">
                        <p className="label_Profile"><b>Nota: </b> {userGrade(grade)}</p>
                    </div>
                    <div id="state">
                        <p className="label_Profile"><b>Estado: </b> {state}</p>
                    </div>
                    <div id="type">
                        <p className="label_Profile"><b>Tipo de utilizador: </b> {type}</p>
                    </div>

                    <div className="btn-group" id="change-profile-info">
                        <div id="changeProfileInfo_Profile">
                            <Link to="/change-profile">
                                <button type="button" className="btn btn-secondary btn-sm">Editar Perfil</button>
                            </Link>
                        </div>

                        <div id="changePassword_Profile">
                            <button onClick={ () => navigate("/change-password")} type="button" className="btn btn-warning btn-sm">Alterar Palavra-Passe</button>
                        </div>

                    </div>

                </div>
            </div>

        </>

    )
}

export default Profile