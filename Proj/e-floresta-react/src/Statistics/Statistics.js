import './Statistics.css'
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { CDBContainer } from 'cdbreact';
import Chart from 'chart.js/auto';

const Statistics = () => {
    const [data] = useState({
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
            <CDBContainer>
                <h3 className="mt-5">Line chart</h3>
                <Line data={data} options={{ responsive: true }} />
            </CDBContainer>
        </>
    );
};



export default Statistics;