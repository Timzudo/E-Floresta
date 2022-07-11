import './Statistics.css'
import React, { useState } from 'react';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Row} from "react-bootstrap";
import {Pie} from "react-chartjs-2";
import PieChartStatistics from "../util/Statistics/PieChartStatistics";
import NumberStatistics from "../util/Statistics/NumberStatistics";


const Statistics = () => {

    const [utilSoloByNumber] = useState({
        labels: ['Privado', 'Comercial', 'Pasto', 'Floresta', 'Agrícola', 'Residencial', 'Transporte', 'Recreativo'],
        datasets: [
            {
                label: 'Percentagem por quantidade de parcelas',
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
                data: [4, 12, 10, 5, 1, 3, 1, 1],
            },
        ],
    });


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
            <TopBar />

            <div className="statistics-background">
                <Row>
                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Área total das parcelas </h4>
                        <h6 className="stats-title"> 562m² </h6>
                    </Col>

                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Média da área das parcelas </h4>
                        <h6 className="stats-title"> 804m² </h6>
                    </Col>

                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Perímetro total das parcelas </h4>
                        <h6 className="stats-title"> 1800m </h6>
                    </Col>

                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Média do perímetro das parcelas </h4>
                        <h6 className="stats-title"> 804m </h6>
                    </Col>

                    <Col className="stats-entity-container">
                        <p></p>
                        <h4 className="stats-entity-title"> Número de parcelas que registei </h4>
                        <h6 className="stats-entity-title"> 11 </h6>
                    </Col>

                </Row>

                <Row>

                    <p></p>
                    <p className="stats-paragraph" ></p>
                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Número de parcelas por tipo de utilização do solo </h4>
                        <Pie className="util-solo-byNumber_Stats" data={utilSoloByNumber} options={{ responsive: true }} />
                    </Col>

                    <Col className="stats-container">
                        <p></p>
                        <h4 className="stats-title"> Área de parcelas por tipo de utilização do solo </h4>
                        <Pie className="util-solo-byArea_Stats" data={utilSoloByArea} options={{ responsive: true }} />
                    </Col>

                </Row>
                <PieChartStatistics url="asd"></PieChartStatistics>
                <NumberStatistics url="asd" type="area"></NumberStatistics>
            </div>


        </>
    );
};


export default Statistics;