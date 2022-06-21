import './ChangePassword.css'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import React, { Component }  from 'react';

const ChangePassword = () => {

    let oldPassword, newPassword, confirmation

    let xmlhttp = new XMLHttpRequest();

    const { language } = this.props;

    function changePassword() {

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Palavra-passe alterada com sucesso.");
                    window.location.href = "/profile";
                } else if (xmlhttp.status == 400) {
                    alert("A nova palavra-passe e a confirmação não coincidem.")
                } else if (xmlhttp.status == 403 || xmlhttp.status == 404) {  //TODO: tratar de forma diferente se a pessoa errar a oldPassword
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    window.location.href = "/";
                } else {
                    alert("Não foi alterar a palavra-passe.");
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

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/modify/password");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return (
        <>
            <CheckIfLoggedOut/>
            <TopBar/>

            <div className="body-changePassword">
                <div id="oldPassword_ChangePassword">
                    {language == "EN" ? "Old Password:": "Palavra-Passe Antiga:"} {oldPassword} <input className="fields_ChangePassword" id="old-password" type="password"/>
                </div>
                <div id="newPassword_ChangePassword">
                    {language == "EN" ? "New Password:": "Nova Palavra-Passe:"} {newPassword} <input className="fields_ChangePassword" id="new-password" type="password"/>
                </div>
                <div id="confirmPassword_ChangePassword">
                    {language == "EN" ? "Confirm new Password:": "Confirmar nova Palavra-Passe:"} {confirmation} <input className="fields_ChangePassword" id="confirm-password" type="password"/>
                </div>

                <div className="btn-group" id="confirmAndCancel_ChangePassword">
                    <div id="confirm_ChangePassword">
                        <Button type="button" className="btn btn-success btn-sm" onClick={changePassword} >{language == "EN" ? "Confirm Changes": "Confirmar Alterações"}</Button>
                    </div>

                    <div id="cancel_ChangePassword">
                        <Link to="/profile">
                            <Button type="button" className="btn btn-secondary btn-sm">{language == "EN" ? "Cancel Changes": "Cancelar Alterações"} </Button>
                        </Link>
                    </div>
                </div>

            </div>
        </>
    )

}

export default ChangePassword