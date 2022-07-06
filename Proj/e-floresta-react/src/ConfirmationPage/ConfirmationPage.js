import React, {useEffect} from 'react';
import {Link} from "react-router-dom";
import Image from "../logo.png";
import {Spinner} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useState} from "react";



const ConfirmationPage = () => {
    const [confirmed, setConfirmed] = useState(false);
    const search = useLocation().search;
    const name = new URLSearchParams(search).get('id');
    console.log(name);

    useEffect(() => {
        fetch("https://moonlit-oven-349523.appspot.com/rest/register/confirm/" + name).then(r => setConfirmed(true)).catch( () =>alert("yau"));
    }, [])

    function body(){
        if(confirmed){
            return(<span>O seu e-mail foi confirmado com sucesso, pode voltar à pagina inicial.</span>)
        }
        else{
            return(<>
                <span>A confirmar o seu e-mail, por favor aguarde...</span>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner></>)
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