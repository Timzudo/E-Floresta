import "./RecoverPassword.css"
import React, {useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import Image from "../logo.png";
import {Button, Form, Spinner} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useState} from "react";



const RecoverPassword = () => {
    const navigate = useNavigate();
    const search = useLocation().search;
    const name = new URLSearchParams(search).get('id');
    console.log(name);

    const submitHandler = (e) => {
        e.preventDefault();
    }

    function showPassword() {
        var x = document.getElementById("session-password");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }

        var y = document.getElementById("session-confirmation");
        if (y.type === "password") {
            y.type = "text";
        } else {
            y.type = "password";
        }
    }

    function recoverPassword(){
        let myObj = {newPassword:document.getElementById("session-password").value,
                        confirmation:document.getElementById("session-confirmation").value};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/login/recoverpassword/"+name, options)
            .then((r) => {
                if(r.ok){
                    navigate("/create-and-login");
                }
                else if(r.status === 400) {
                    alert("Todos os campos devem ser preenchidos corretamente.");
                }
                else if(r.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404) {
                    alert("Utilizador não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            });
    }


    return(
        <>
            <div className="home_top">
                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>

            <div className="bg-img_RecoverPassword">
                <div className="report-body_RecoverPassword">

                    <br/>
                    <h3 className="title_RecoverPassword"><b>Defina a sua nova palavra-passe</b></h3>
                    <br/>

                    <Form onSubmit={submitHandler}>

                        <Form.Group className="changePassword_RecoverPassword" >
                            <Form.Label>Escreva a sua nova palavra-passe:</Form.Label>
                            <Form.Control type="password" placeholder="Nova palavra-passe" id="new-password_RecoverPassword"/>
                        </Form.Group>
                        <Form.Group className="changePassword_RecoverPassword" >
                            <Form.Label>Confirme a sua nova palavra-passe:</Form.Label>
                            <Form.Control type="password" placeholder="Nova palavra-Passe" id="confirmation_RecoverPassword"/>
                        </Form.Group>

                        <Form.Group className="checkbox_RecoverPassword" controlId="loginShowPassCheckbox" >
                            <Form.Check id="checkmark-RecoverPassword" type="checkbox" label="Mostrar Palavra-Passe" onClick={showPassword}/>
                        </Form.Group>

                        <Button id="confirm-button_RecoverPassword" type="submit" variant="success" onClick={recoverPassword}>
                            Alterar palavra-passe
                        </Button>
                    </Form>
                </div>
            </div>

        </>
    )
}

export default RecoverPassword