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
            {sent?<div>Pedido enviado com sucesso!</div>:<Form onSubmit={submitHandler}>

                <Form.Group className="session-form" >
                    <Form.Control type="text" placeholder="Email" id="session-email"/>
                </Form.Group>
                <Button id="session-button" type="submit" onClick={recoverPassword}>
                    Enviar pedido de recuperação.
                </Button>
            </Form>}
        </>
    )
}

export default RecoverPassword