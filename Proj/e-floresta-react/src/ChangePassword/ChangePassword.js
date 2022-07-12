import './ChangePassword.css'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Button} from "react-bootstrap";
import {Link, useLocation, useNavigate} from "react-router-dom";
import React, { Component }  from 'react';

const ChangePassword = () => {
    const navigate = useNavigate();
    let oldPassword, newPassword, confirmation
    let xmlhttp = new XMLHttpRequest();

    function changePassword() {

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    alert("Palavra-passe alterada com sucesso.");
                    navigate("/profile");
                } else if (xmlhttp.status === 400) {
                    alert("A nova palavra-passe e a confirmação não cumprem os requisitos.")
                } else if (xmlhttp.status === 403 || xmlhttp.status === 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                } else if (xmlhttp.status === 500) {
                        alert("Erro do sistema. Tente novamente mais tarde.");
                } else {
                    alert("Não foi alterar a palavra-passe.");
                    console.log(xmlhttp.status);
                }
            }
        }

        var myObj = {
            oldPassword: document.getElementById("old-password").value,
            newPassword: document.getElementById("new-password").value,
            confirmation: document.getElementById("confirm-password").value,
            token: localStorage.getItem('token')
        };

        var myJson = JSON.stringify(myObj);

        xmlhttp.open("PUT", "https://moonlit-oven-349523.appspot.com/rest/modify/password");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return (
        <>
            <CheckIfLoggedOut/>
            <TopBar/>

            <div className="bg-img_ChangePassword">
                <div className="body-changePassword">
                    <h2 className="title_ChangePassword"><b>Altere a sua palavra-passe</b></h2>
                    <br/>
                    <div id="oldPassword_ChangePassword">
                        Palavra-Passe Antiga: {oldPassword} <input className="fields_ChangePassword" id="old-password_ChangePassword" type="password" maxLength="64"/>
                    </div>
                    <div id="newPassword_ChangePassword">
                        Nova Palavra-Passe: {newPassword} <input className="fields_ChangePassword" id="new-password_ChangePassword" type="password" maxLength="64"/>
                    </div>
                    <div id="confirmPassword_ChangePassword">
                        Confirmar nova Palavra-Passe: {confirmation} <input className="fields_ChangePassword" id="confirm-password_ChangePassword" type="password" maxLength="64"/>
                    </div>

                    <div className="btn-group" id="confirmAndCancel_ChangePassword">
                        <div id="confirm_ChangePassword">
                            <Button type="button" className="btn btn-success btn-sm" onClick={changePassword} >Confirmar Alterações</Button>
                        </div>

                        <div id="cancel_ChangePassword">
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

export default ChangePassword