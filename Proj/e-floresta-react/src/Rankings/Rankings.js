import './Rankings.css'
import React, { useState } from 'react';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Row, Table} from "react-bootstrap";
import CheckIfActive from "../util/CheckIfActive";
import RankingListStatistics from "../util/Statistics/RankingListStatistics";


const Rankings = () => {


    return (
        <>
            <CheckIfLoggedOut />
            <CheckIfActive />
            <TopBar />

            <div className="rankings-background">

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais pontos de confiança </h2>

                <Row className="rankings-container">
                    <RankingListStatistics type="userTrust" labelA="Utilizador" labelB="Nível de Confiança" url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/byUserUserTrust"/>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com maior área de parcelas </h2>

                <Row className="rankings-container">
                    <RankingListStatistics type="parcelArea" labelA="Utilizador" labelB="Área em m²" url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/byUserParcelArea"/>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais parcelas registadas</h2>

                <Row className="rankings-container">
                    <RankingListStatistics type="parcelCount" labelA="Utilizador" labelB="Número de parcelas" url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/byUserParcelCount"/>
                </Row>
            </div>

        </>
    );
};


export default Rankings;