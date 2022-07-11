import './RecoverRequest.css'

import React from 'react';
import {Link, useNavigate} from "react-router-dom";
import Image from "../logo.png";
import {Button, Form} from "react-bootstrap";
import {useState} from "react";



const RecoverPassword = () => {
    const [sent, setSent] = useState(false);

    const submitHandler = (e) => {
        e.preventDefault();
    }

    function recoverPassword(){
        fetch("https://moonlit-oven-349523.appspot.com/rest/login/forgotpassword/?email="+document.getElementById("session-email").value)
            .then((r) => {
                if(r.ok){
                    setSent(true);
                }
            }).catch(console.log);
    }


    return(
        <>
            <div className="home_top">
                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>
            {sent?<div>Pedido enviado com sucesso!</div>:

                <div className="bg-img_RecoverRequest">
                    <div className="body_RecoverRequest">
                        <br/>
                        <h2 className="title_RecoverRequest"><b>Esqueceu a sua palavra-passe?</b></h2>
                        <p className="description_RecoverRequest">Insira o seu e-mail para receber um link de recuperação da sua palavra-passe.</p>
                        <input id="email_RecoverRequest" type="email" placeholder="Email" maxLength="64"/>
                        <Button id="button_RecoverRequest" type="submit" variant="success" onClick={recoverPassword}>
                            Enviar pedido de recuperação
                        </Button>
                    </div>
                    <Form onSubmit={submitHandler}></Form>
                </div>}

            }
        </>
    )
}

export default RecoverPassword