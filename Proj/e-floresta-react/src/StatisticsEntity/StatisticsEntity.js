import './StatisticsEntity.css'
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Row} from "react-bootstrap";


const StatisticsEntity = () => {

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
                data: [0.4, 0.12, 0.10, 0.05, 0.1, 0.03, 0.1, 0.1],
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
                data: [0.2, 0.05, 0.15, 0.05, 0.3, 0.04, 0.2, 0.01],
            },
        ],
    });



    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <Row class>
                <p></p>
                <h2 className="statistics-title">Tipos de Utilização do Solo</h2>
                <Col>
                    <h6 className="graph-title">Percentagem por quantidade de parcelas</h6>
                    <Pie className="util-solo-graph" data={utilSoloByNumber} options={{ responsive: true }} />
                </Col>
                <Col>
                    <h6 className="graph-title">Percentagem por área de parcelas</h6>
                    <Pie className="util-solo-graph" data={utilSoloByArea} options={{ responsive: true }} />
                </Col>
            </Row>


        </>
    );
};



export default StatisticsEntity;