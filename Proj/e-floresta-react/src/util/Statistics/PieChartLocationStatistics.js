import './Statistics.css'
import React, { useState } from 'react';
import {Pie} from "react-chartjs-2";
import {useEffect} from "react";
import {Col, Dropdown, Form, Spinner} from "react-bootstrap";


const PieChartLocationStatistics = (props) => {

    const objCSV = JSON.parse(localStorage.getItem('csv'));
    const distritos = Object.keys(objCSV);
    const distritoList = [];
    for(let i = 0; i<distritos.length; i++) {
        distritoList.push(<option>{distritos[i]}</option>)
    }

    const [distrito, setDistrito] = useState("");
    const [concelho, setConcelho] = useState("");
    const [freguesia, setFreguesia] = useState("");
    const [concelhoOptions, setConcelhoOptions] = useState([]);
    const [freguesiaOptions, setFreguesiaOptions] = useState([]);

    function handleSetDistrito(distrito){
        console.log(distrito);
        setDistrito(distrito);
        if(distrito !== '-'){
            let listC = Object.keys(objCSV[distrito]);

            let list = [];
            for(let i = 0; i<listC.length; i++){
                list.push(<option>{listC[i]}</option>);
            }
            setConcelhoOptions(list);
        }
        else{
            setConcelhoOptions([]);
        }
        setFreguesiaOptions([]);


        if(distrito !== '-'){
            setRequestDistrito(true);
            let myObj = {token:localStorage.getItem('token')};

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myObj),
            };

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaUsage/'+distrito, options)
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

                            setLabelListDistrito(auxLabelList);
                            setDataListDistrito(auxDataList);
                        })
                    }
                    setRequestDistrito(false);
                }).catch(() =>setRequestDistrito(false));
        }
        else {
            setLabelListDistrito([]);
            setDataListDistrito([]);
        }
    }

    function handleSetConcelho(concelho){
        console.log(concelho);
        setConcelho(concelho);
        if(concelho !== '-'){
            let listF = Object.keys(objCSV[distrito][concelho]);
            let list = [];
            for(let i = 0; i<listF.length; i++){
                list.push(<option>{listF[i]}</option>);
            }
            setFreguesiaOptions(list);
        }
        else{
            setFreguesiaOptions([]);
        }

        if(concelho !== '-'){
            setRequestConcelho(true);
            let myObj = {token:localStorage.getItem('token')};

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myObj),
            };

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaUsage/'+distrito+'/'+concelho, options)
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

                            setLabelListConcelho(auxLabelList);
                            setDataListConcelho(auxDataList);
                        })
                    }
                    setRequestConcelho(false);
                }).catch(() =>setRequestConcelho(false));
        }
        else {
            setLabelListConcelho([]);
            setDataListConcelho([]);
        }

    }

    function handlesetFreguesia(freguesia){
        setFreguesia(freguesia);
        if(freguesia !== '-'){
            setRequestFreguesia(true);
            let myObj = {token:localStorage.getItem('token')};

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myObj),
            };

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaUsage/'+distrito+'/'+concelho+'/'+freguesia, options)
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

                            setLabelListFreguesia(auxLabelList);
                            setDataListFreguesia(auxDataList);
                        })
                    }
                    setRequestFreguesia(false);
                }).catch(() =>setRequestFreguesia(false));
        }
        else {
            setLabelListFreguesia([]);
            setDataListFreguesia([]);
        }
    }

    const [labelListDistrito, setLabelListDistrito] = useState([]);
    const [dataListDistrito, setDataListDistrito] = useState([]);
    const [requestDistrito, setRequestDistrito] = useState(false);

    let dataOptionsDistrito = {
        labels: labelListDistrito,
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
                data: dataListDistrito,
            },
        ],
    };

    const [labelListConcelho, setLabelListConcelho] = useState([]);
    const [dataListConcelho, setDataListConcelho] = useState([]);
    const [requestConcelho, setRequestConcelho] = useState(false);

    let dataOptionsConcelho = {
        labels: labelListConcelho,
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
                data: dataListConcelho,
            },
        ],
    };

    const [labelListFreguesia, setLabelListFreguesia] = useState([]);
    const [dataListFreguesia, setDataListFreguesia] = useState([]);
    const [requestFreguesia, setRequestFreguesia] = useState(false);

    let dataOptionsFreguesia = {
        labels: labelListFreguesia,
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
                data: dataListFreguesia,
            },
        ],
    };


    /*useEffect(() => {
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
    }, [])*/

    return (
        <>
            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo no distrito de: {distrito}</h4>

                <Form.Group className="mt-3 pie-loc" controlId="pie_distrito">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                        <option disabled={true} value="-">Distritos</option>
                        {distritoList}
                    </Form.Select>
                </Form.Group>

            {requestDistrito?<Spinner animation="border" variant="success" />:(dataListDistrito.length>0?<Pie className="util-solo-byArea_StatsAdmin" data={dataOptionsDistrito} options={{ responsive: true }}/>:<span>Não existem parcelas nesta área.</span>)}
            </Col>

            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo no concelho de: {concelho}</h4>

                <Form.Group className="mt-3 pie-loc" controlId="pie_concelho">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                        <option value="-">Concelhos</option>
                        {concelhoOptions}
                    </Form.Select>
                </Form.Group>

            {requestConcelho?<Spinner animation="border" variant="success" />:(dataListConcelho.length>0?<Pie className="util-solo-byArea_StatsAdmin" data={dataOptionsConcelho} options={{ responsive: true }}/>:<span>Não existem parcelas nesta área.</span>)}
            </Col>

            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo na freguesia de: {freguesia}</h4>

                <Form.Group className="mt-3 pie-loc" controlId="pie_freguesia">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handlesetFreguesia(e.target.value)}>
                        <option value="-">Freguesias</option>
                        {freguesiaOptions}
                    </Form.Select>
                </Form.Group>

            {requestFreguesia?<Spinner animation="border" variant="success" />:(dataListFreguesia.length>0?<Pie className="util-solo-byArea_StatsAdmin" data={dataOptionsFreguesia} options={{ responsive: true }}/>:<span>Não existem parcelas nesta área.</span>)}
            </Col>
        </>
    );
};


export default PieChartLocationStatistics;