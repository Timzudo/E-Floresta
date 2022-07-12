import React, {useEffect} from 'react'
import  './ChangeProfile.css'
import TopBar from '../TopBar/TopBar.js'
import ProfileImage from "./profile_picture.png";
import {Link, useNavigate} from "react-router-dom";
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Badge, Button} from "react-bootstrap";
import {useState} from "react";

const ChangeProfile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [nif, setNif] = useState("");
    const [type, setType] = useState("");

    let xmlhttp = new XMLHttpRequest();

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
                } else if(xmlhttp.status === 403 || xmlhttp.status === 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                }
                else if (xmlhttp.status === 500){
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


    function changeProfile() {

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    alert("Informação alterada com sucesso.");
                    navigate("/profile");
                } else if(xmlhttp.status === 403 ||xmlhttp.status === 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                }
                else {
                    console.log(xmlhttp.status);
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {name:document.getElementById("change-complete-name").value,
            phone:document.getElementById("change-phone").value,
            nif:document.getElementById("change-nif").value,
            token:localStorage.getItem('token')
        };

        var myJson = JSON.stringify(myObj);

        xmlhttp.open("PUT", "https://moonlit-oven-349523.appspot.com/rest/modify/info/"+username);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_ChangeProfile">
                <div className="profileInfo_ChangeProfile">
                    <img src={ProfileImage} alt="Profile picture" className="profile_pic"/>
                    <p></p>
                    <div id="username_ChangeProfile">
                        <p className="label_ChangeProfile"><b>Username: </b> {username} </p>
                    </div>
                    <div id="email_ChangeProfile">
                        <p className="label_ChangeProfile"><b>E-mail: </b> {email} </p>
                    </div>
                    <div id="name_ChangeProfile">
                        <label className="label_ChangeProfile"><b>Nome Completo: </b> </label>
                        <input id="change-complete-name" type="text" defaultValue={name} maxLength="64"/>
                    </div>
                    <div id="phone_ChangeProfile">
                        <label className="label_ChangeProfile"><b>Telemóvel/Telefone: </b></label>
                        <input id="change-phone" type="number" defaultValue={phone} maxLength="9"/>
                    </div>
                    <div id="nif_ChangeProfile">
                        <label className="label_ChangeProfile" htmlFor="change-nif"><b>NIF: </b></label>
                        <input id="change-nif" type="number" defaultValue={nif} maxLength="9"/>
                    </div>
                    <div id="type_ChangeProfile">
                        <p className="label_ChangeProfile"> <b>Tipo de utilizador: </b> {type} </p>
                    </div>

                    <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                        <div id="confirmChanges_ChangeProfile">
                            <Button type="button" className="btn btn-success btn-sm" onClick={changeProfile}>Confirmar
                                Alterações</Button>
                        </div>

                        <div id="cancelChanges_ChangeProfile">
                            <Link to="/profile">
                                <Button type="button" className="btn btn-secondary btn-sm">Cancelar Alterações </Button>
                            </Link>

                        </div>
                    </div>

                </div>
            </div>

        </>

    )
}

export default ChangeProfile