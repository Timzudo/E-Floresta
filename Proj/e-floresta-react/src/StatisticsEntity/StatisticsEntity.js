import './StatisticsEntity.css'
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Form, Row} from "react-bootstrap";


const StatisticsEntity = () => {
 //   const [freguesiaOptions, setFreguesiaOptions] = useState([]);

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


    const [nrParcelsPerFreguesiaInConcelho] = useState({
        labels: ['Colares', 'S. João das Lampas', 'S. Martinho', 'Terrugem', 'Santa Maria e S.Miguel', 'S. Pedro de Penaferrim', 'Montelavar',
        'Pero Pinheiro', 'Algueirão-Men Martins', 'Rio de Mouro', 'Agualva-Cacém', 'Massamá', 'Belas', 'Almargem do Bispo', 'Casal de Cambra',
        'Monte Abraão', 'Queluz'],
        datasets: [
            {
                label: 'Parcelas nas Freguesias de Sintra',
                backgroundColor: 'rgba(62, 80, 58, 0.9)',
                borderColor: 'rgb(62, 80, 58)',
                data: [35, 12, 69, 46, 2, 84, 82, 34, 56, 90, 42, 26, 98, 19, 78, 38, 50],
            },
        ],
    });


    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="statistics-background">
                <Row>
                    <p></p>
                    <h2 className="stats-entity-title"> Tipos de Utilização do Solo </h2>

                    <Col className="stats-entity-container">
                        <h6 className="graph-entity-title"> Percentagem por quantidade de parcelas </h6>
                        <Pie className="util-solo-graph_StatsEntity" data={utilSoloByNumber} options={{ responsive: true }} />
                    </Col>

                    <Col className="stats-entity-container">
                        <h6 className="graph-entity-title"> Percentagem por área de parcelas </h6>
                        <Pie className="util-solo-graph_StatsEntity" data={utilSoloByArea} options={{ responsive: true }} />
                    </Col>
                </Row>

                <h2 className="stats-entity-title"> Número de Parcelas num Concelho de uma Freguesia </h2>

                <Row className="stats-entity-container">
                    <Bar className="nrParcels-in-concelho-per-freguesia_StatsEntity" data={nrParcelsPerFreguesiaInConcelho} options={{ responsive: true }} />
                </Row>
            </div>

        </>
    );
};


export default StatisticsEntity;