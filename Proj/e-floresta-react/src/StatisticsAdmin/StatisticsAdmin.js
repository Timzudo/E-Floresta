import './StatisticsAdmin.css'
import React, { useState } from 'react';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Dropdown, Row, Table} from "react-bootstrap";
import { Pie } from 'react-chartjs-2';
import NumberStatistics from "../util/Statistics/NumberStatistics";
import CheckIfActive from "../util/CheckIfActive";
import PieChartLocationStatistics from "../util/Statistics/PieChartLocationStatistics";
import NumberLocationStatistics from "../util/Statistics/NumberLocationStatistics";
import RankingListStatistics from "../util/Statistics/RankingListStatistics";


const StatisticsAdmin = () => {


    const [utilSoloByArea] = useState({
        labels: ['Privado', 'Comercial', 'Pasto', 'Floresta', 'Agrícola', 'Residencial', 'Transporte', 'Recreativo'],
        datasets: [
            {
                label: 'Percentagem por área de parcelas',
                backgroundColor: [
                    'rgba(0, 0, 0, 0.2)',
                    'rgba(51, 51, 255, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(102, 204, 0, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 128, 0, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(204, 153, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(51, 51, 255, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(102, 204, 0, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 128, 0, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(204, 153, 255, 1)'
                ],
                borderWidth: 2,
                data: [200, 50, 150, 50, 300, 40, 200, 10],
            },
        ],
    });


    return (
        <>
            <CheckIfLoggedOut />
            <CheckIfActive />
            <TopBar />

            <div className="statistics-admin-background">
                <Row>
                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área total das parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/areaTotal" label="m²"></NumberStatistics>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Média da área das parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAvgArea" label="m²"></NumberStatistics>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Número de parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCount" label=""></NumberStatistics>
                    </Col>
                    <p></p>
                </Row>

                <Row>

                    <p className="stats-admin-paragraph"></p>
                   <NumberLocationStatistics/>

                </Row>


                <Row>

                    <p></p>
                    <p className="stats-admin-paragraph" ></p>
                    <PieChartLocationStatistics/>

                </Row>

                <p></p>
                <p className="stats-admin-paragraph"></p>
                <h2 className="rankings-title_StatsAdmin"> Ranking de distritos e concelhos com mais parcelas registadas </h2>

                <Row className="rankings-container_StatsAdmin">
                    <Col>
                        <RankingListStatistics type="count" labelA="Distrito" labelB="Número de parcelas registadas" url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/distritosByParcelCount"/>
                    </Col>

                    <Col>
                        <RankingListStatistics type="count" labelA="Concelho" labelB="Número de parcelas registadas" url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/concelhosByParcelCount"/>
                    </Col>

                </Row>
            </div>

        </>
    );
}

export default StatisticsAdmin;