import React, {useEffect} from 'react';
import {Link} from "react-router-dom";
import Image from "../logo.png";
import {Spinner} from "react-bootstrap";
import {useLocation} from "react-router-dom";
import {useState} from "@types/react";



const ConfirmationPage = () => {
    const [confirmed, setConfirmed] = useState(false);
    const search = useLocation().search;
    const name = new URLSearchParams(search).get('id');
    console.log(name);

    useEffect(() => {
        fetch("https://moonlit-oven-349523.oa.r.appspot.com/rest/register/confirm/" + name).then(r => alert(r.status));
    }, [])

    function body(){
        if(confirmed){

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
            <span>A confirmar o seu e-mail, por favor aguarde...</span>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </>
    )
}

export default ConfirmationPage