import "./ConfirmationPage.css"

import React, {useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import Image from "../logo.png";
import {Spinner} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useState} from "react";


const ConfirmationPage = () => {
    const navigate = useNavigate();

    const [confirmed, setConfirmed] = useState(false);
    const search = useLocation().search;
    const name = new URLSearchParams(search).get('id');
    console.log(name);

    useEffect(() => {
        fetch("https://moonlit-oven-349523.appspot.com/rest/register/confirm/" + name).then(r => {setConfirmed(true); navigate("/create-and-login")}).catch( () =>console.log);
    }, [])

    function body(){
        if(confirmed){
            return(
                <div className="bg-img_ConfirmationPage">
                    <div className="report-body_ConfirmationPage">
                        <br/>
                        <h4 className="title_ConfirmationPage"><b>O seu e-mail foi confirmado com sucesso, pode voltar à pagina inicial.</b></h4>
                    </div>
                </div>
            )
        }
        else{
            return(<>
                <div className="bg-img_ConfirmationPage">
                    <div className="report-body_ConfirmationPage">
                        <br/>
                        <h4 className="title_ConfirmationPage"><b>A confirmar o seu e-mail, por favor aguarde...</b></h4>
                        <span>
                            <Spinner id="spinner_ConfirmationPage" animation="border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </Spinner>
                        </span>
                    </div>
                </div>

            </>)
        }
    }

    return(
        <>
            <div className="home_top">

                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>
            {body()}
        </>
    )
}

export default ConfirmationPage