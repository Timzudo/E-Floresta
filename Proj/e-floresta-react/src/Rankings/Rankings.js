import './Rankings.css'
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Row} from "react-bootstrap";


const Rankings = () => {

    const [userTrust] = useState({
        labels: ['Valentina', 'Valdisnei', 'Josefino', 'Amelia', 'Tristão'],
        datasets: [
            {
                label: 'Utilizadores com melhor User trust',
                backgroundColor: 'rgba(176, 192, 144, 0.5)',
                borderColor: 'rgb(62, 80, 58)',
                data: [98,96,90,87,82],
            },
        ],
    });

    const [biggerArea] = useState({
        labels: ['Matilda', 'Cleide', 'Cristiano', 'Josemiro', 'Palmira'],
        datasets: [
            {
                label: 'Utilizadores com maior área de parcelas',
                backgroundColor: 'rgba(176, 192, 144, 0.5)',
                borderColor: 'rgb(62, 80, 58)',
                data: [3524,3283,2987,2365,2013],
            },
        ],
    });

    const [mostParcels] = useState({
        labels: ['Carla', 'Clotilde', 'Ambrósio', 'Gisela', 'Jurandir'],
        datasets: [
            {
                label: 'Utilizadores com mais parcelas registadas',
                backgroundColor: 'rgba(176, 192, 144, 0.5)',
                borderColor: 'rgb(62, 80, 58)',
                data: [45,41,38,34,29],
            },
        ],
    });


    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="rankings-background">

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais pontos de confiança </h2>

                <Row className="rankings-container">
                    <Bar className="userTrust_Rankings" data={userTrust} options={ {indexAxis: 'y', responsive: true } } />
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com maior área de parcelas </h2>

                <Row className="rankings-container">
                    <Bar className="biggerArea_Rankings" data={biggerArea} options={ {indexAxis: 'y', responsive: true } } />
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais parcelas registadas</h2>

                <Row className="rankings-container">
                    <Bar className="mostParcels_Rankings" data={mostParcels} options={ {indexAxis: 'y', responsive: true } } />
                </Row>
            </div>

        </>
    );
};


export default Rankings;