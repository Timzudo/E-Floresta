import  './LoggedHomepage.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Button, Carousel, Modal} from "react-bootstrap";
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import React, { Component }  from 'react';
import CSVConverter from "../util/CSVConverter";
import {Link, useNavigate} from "react-router-dom";

const LoggedHomepage = () => {
    const navigate = useNavigate();
    let role = localStorage.getItem('role');

    function registerButton(){
        if(role === 'D'){
            navigate("/map");
        }
        else if(role.includes("A") || role.includes("B")){
            navigate("/map-admin");
        }
    }

    function parcelsButton(){
        switch (role) {
            case 'D':
                navigate("/my-parcels");
                break;
            case 'C':
                navigate("/parcels-entity");
                break;
            case 'B':
                navigate("/all-parcels");
                break;
            case 'A':
                navigate("/all-parcels-admin");
                break;
        }
    }

    function statisticsButton(){
        if(role === 'D'){
            navigate("/statistics");
        }
        else if(role === "C"){
            navigate("/statistics-entity");
        }
        else if(role.includes("B")){
            navigate("/statistics-technician");
        }
        else if(role.includes("A")){
            navigate("/statistics-admin");
        }
    }

    function faqButton(){
        navigate("/faq");
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <CSVConverter/>

            <div className="lgh_body">

                <div className="hero-register_LoggedHome">
                    <div className="hero-register-text_LoggedHome">
                        <h1><b>Registe as suas parcelas</b></h1>
                        No nosso site é possível registar as suas parcelas de forma rápida e fácil. <br/>
                        Clique na aba "Registar Parcelas". Clique no mapa para desenhar o seu terreno e marcar <br/>
                        os seus limites e registe as informações respetivas ao mesmo do lado direito, preenchendo <br/>
                        e selecionando os campos exigidos. Por fim, clique em Submeter. <br/>
                        <p></p>
                            <Button onClick={() => registerButton()} variant="dark">Registe já</Button>
                    </div>
                </div>

                <div className="hero-myParcels_LoggedHome">
                    <div className="hero-myParcels-text_LoggedHome">
                        <h1><b>Verifique as suas parcelas</b></h1>
                        O site E-Floresta permite-lhe guardar toda a informação sobre os seus terrenos num único sítio,<br/>
                        para um acesso rápido e fácil. Clique na aba "Minhas Parcelas". O mapa do lado esquerdo contém <br/>
                        marcados todos os seus terrenos registados. Do lado direito, existe um cartão para cada uma das <br/>
                        propriedades registadas. Clique em "Detalhes" para ver todas as informações sobre uma parcela. <br/>
                        Clique em "Editar" para alterar alguma informação sobre a parcela em causa. <br/>
                        <p></p>
                        <Link to="/my-parcels">
                            <Button onClick={() => parcelsButton()} variant="dark">Verifique as suas parcelas</Button>
                        </Link>
                    </div>
                </div>

                <div className="hero-stats_LoggedHome">
                    <div className="hero-stats-text_LoggedHome">
                        <h1><b>Estatísticas personalizadas</b></h1>
                        O E-Floresta possui estatísticas personalizadas sobre as suas parcelas registadas para facilitar <br/>
                        ainda mais a organização e o gerenciamento dos seus terrenos. Para lhes aceder, clique na aba "Estatísticas". <br/>
                        <p></p>
                        <Link to="/statistics">
                            <Button onClick={() => statisticsButton()} variant="dark">Veja as estatísticas</Button>
                        </Link>
                    </div>
                </div>

                <div className="hero-faq_LoggedHome">
                    <div className="hero-faq-text_LoggedHome">
                        <h1><b>Dúvidas sobre o site?</b></h1>
                        O nosso site possui uma área onde reunimos algumas das dúvidas mais comuns relativamente <br/>
                        ao funcionamento do mesmo. Talvez alguma das suas perguntas esteja respondido nessa área. <br/>
                        Para lhe aceder, clique na aba "FAQ". <br/>
                        <p></p>
                        <Link to="/faq">
                            <Button onClick={() => faqButton()} variant="dark">Perguntas frequentes</Button>
                        </Link>
                    </div>
                </div>

            </div>
        </>
    )
}

export default LoggedHomepage
