import './Statistics.css'
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";


const Statistics = () => {



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
        height: '50px',
        width: '100%',
    });

    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <h3 className="mt-4">Line chart</h3>
            <Line className="example-graph" data={exemplo} options={{ responsive: true }} />
        </>
    );
};



export default Statistics;