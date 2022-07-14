import './StatisticsTechnician.css'
import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Row} from "react-bootstrap";
import NumberStatistics from "../util/Statistics/NumberStatistics";
import PieChartStatistics from "../util/Statistics/PieChartStatistics";
import CheckIfActive from "../util/CheckIfActive";


const StatisticsTechnician = () => {

    let role = localStorage.getItem("role");

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
            <CheckIfActive />
            <TopBar />

            <div className="statistics-technician-background">
                <Row>
                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Área total das parcelas </h4>
                        {
                            role === "B1" ?
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/totalParcelAreaInConcelho" label="m²"></NumberStatistics> :
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/totalParcelAreaInFreguesia" label="m²"></NumberStatistics>
                        }
                    </Col>

                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Média da área das parcelas </h4>
                        {
                            role === "B1" ?
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAvgAreaInConcelho" label="m²"></NumberStatistics> :
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAvgAreaInFreguesia" label="m²"></NumberStatistics>
                        }
                    </Col>

                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Perímetro total das parcelas </h4>
                        <h6 className="stats-technician-title"> 1800m </h6>
                    </Col>

                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Média do perímetro das parcelas </h4>
                        <h6 className="stats-technician-title"> 804m </h6>
                    </Col>

                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Número de parcelas que registei </h4>
                        {
                            role === "B1" ?
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCountInConcelho" label=""></NumberStatistics> :
                                <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCountInFreguesia" label=""></NumberStatistics>
                        }
                    </Col>
                </Row>

                <Row>

                    <p></p>
                    <p className="stats-technician-paragraph" ></p>
                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Número de parcelas por tipo de utilização do solo </h4>
                        {
                            role === "B1" ?
                                <PieChartStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCountInConcelhoByUsage"></PieChartStatistics>:
                                <PieChartStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCountInFreguesiaByUsage"></PieChartStatistics>
                        }
                    </Col>

                    <Col className="stats-technician-container">
                        <p></p>
                        <h4 className="stats-technician-title"> Área de parcelas por tipo de utilização do solo </h4>
                        {
                            role === "B1" ?
                                <PieChartStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAreaInConcelhoByUsage"></PieChartStatistics>:
                                <PieChartStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAreaInFreguesiaByUsage"></PieChartStatistics>
                        }
                    </Col>

                </Row>
            </div>

        </>
    );
};


export default StatisticsTechnician;