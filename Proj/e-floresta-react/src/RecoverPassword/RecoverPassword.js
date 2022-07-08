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

    /*useEffect(() => {
        fetch("https://moonlit-oven-349523.appspot.com/rest/register/confirm/" + name).then(r => setConfirmed(true)).catch( () =>alert("yau"));
    }, [])*/

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
            });
    }


    return(
        <>
            <div className="home_top">
                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>
            <Form onSubmit={submitHandler}>

                <Form.Group className="session-form" >
                    <Form.Control type="password" placeholder="Palavra-Passe" id="session-password"/>
                </Form.Group>
                <Form.Group className="session-form" >
                    <Form.Control type="password" placeholder="Palavra-Passe" id="session-confirmation"/>
                </Form.Group>

                <Form.Group className="checkbox-container" controlId="loginShowPassCheckbox" >
                    <Form.Check id="checkmark-login" type="checkbox" label="Mostrar Palavra-Passe" onClick={showPassword}/>
                </Form.Group>

                <Button id="session-button" type="submit" onClick={recoverPassword}>
                    Alterar palavra-passe
                </Button>
            </Form>
        </>
    )
}

export default RecoverPassword