import './Statistics.css'
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { HorizontalBar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";


const Statistics = () => {

    const [utilSolo] = useState({
        labels: ['Util1', 'Util2', 'Util3', 'Util4', 'Util5'],
        datasets: [
            {
                label: 'Utilização do solo',
                backgroundColor: 'rgba(194, 116, 161, 0.5)',
                borderColor: 'rgb(194, 116, 161)',
                data: [65, 59, 90, 81, 56, 55, 40],
            },
        ],
    });

    const [rankingUsers] = useState({
        labels: ['Josevaldo', 'Matildina', 'Gertrudes', 'Otavio', 'Godofredo'],
        datasets: [
            {
                label: 'Ranking 5 Users',
                backgroundColor: 'rgba(194, 116, 161, 0.5)',
                borderColor: 'rgb(194, 116, 161)',
                data: [65, 59, 90, 81, 56, 55, 40],
            },
        ],
    });


    const [exemplo] = useState({
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        datasets: [
            {
                label: 'My First dataset',
                backgroundColor: 'rgba(194, 116, 161, 0.5)',
                borderColor: 'rgb(194, 116, 161)',
                data: [65, 59, 90, 81, 56, 55, 40],
            },
        ],
    });

    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <h3 className="mt-5">Utilização do solo em percentagem</h3>
            <Doughnut className="util-solo-graph" data={utilSolo} options={{ responsive: true }} />

            <h3 className="mt-5">Ranking 5 Utilizadores</h3>
            <HorizontalBar data={rankingUsers} options={{ responsive: true }} />

            <h3 className="mt-4">Line chart</h3>
            <Line className="example-graph" data={exemplo} options={{ responsive: true }} />
        </>
    );
};



export default Statistics;