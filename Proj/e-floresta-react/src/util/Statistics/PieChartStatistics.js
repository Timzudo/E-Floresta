import './Statistics.css'
import React, { useState } from 'react';
import {Pie} from "react-chartjs-2";
import {useEffect} from "react";
import {Spinner} from "react-bootstrap";


const PieChartStatistics = (props) => {

    const [labelList, setLabelList] = useState([]);
    const [dataList, setDataList] = useState([]);
    const [request, setRequest] = useState(false);

    let dataOptions = {
        labels: labelList,
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
                data: dataList,
            },
        ],
    };

    useEffect(() => {
        setRequest(true);
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch(props.url, options)
            .then((r) =>{
                if(r.ok){
                    r.text().then(t => {
                        let text = JSON.parse(t);
                        console.log(text)
                        let auxLabelList = [];
                        let auxDataList = [];
                        for (let key in text) {
                            auxLabelList.push(key);
                            auxDataList.push(text[key]);
                        }

                        setLabelList(auxLabelList);
                        setDataList(auxDataList);
                    })
                }
                setRequest(false);
            }).catch(() =>setRequest(false));
    }, [])



    return (
        <>
            {request?<Spinner id="spinner_ConfirmationPage" animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
            </Spinner>: <Pie className="util-solo-byNumber_Stats" data={dataOptions} options={{ responsive: true }} />}
        </>
    );
};


export default PieChartStatistics;