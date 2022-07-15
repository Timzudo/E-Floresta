import './Statistics.css'
import React, { useState } from 'react';
import {Pie} from "react-chartjs-2";
import {useEffect} from "react";
import {Col, Dropdown, Form, Spinner} from "react-bootstrap";


const NumberLocationStatistics = (props) => {

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

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaTotal/'+distrito, options)
                .then((r) =>{
                    if(r.ok){
                        r.text().then(t => {
                            setDistritoResult(t);
                        })
                    }
                    setRequestDistrito(false);
                }).catch(() =>setRequestDistrito(false));
        }
        else {
            setDistritoResult(0);
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
            console.log(concelho);
            setRequestConcelho(true);
            let myObj = {token:localStorage.getItem('token')};

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myObj),
            };

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaTotal/'+distrito+'/'+concelho, options)
                .then((r) =>{
                    if(r.ok){
                        r.text().then(t => {
                            setConcelhoResult(t);
                        })
                    }
                    setRequestConcelho(false);
                }).catch(() =>setRequestConcelho(false));
        }
        else {
            setConcelhoResult(0);
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

            fetch('https://moonlit-oven-349523.appspot.com/rest/statistics/areaTotal/'+distrito+'/'+concelho+'/'+freguesia, options)
                .then((r) =>{
                    if(r.ok){
                        r.text().then(t => {
                            setFreguesiaResult(t);
                        })
                    }
                    setRequestFreguesia(false);
                }).catch(() =>setRequestFreguesia(false));
        }
        else {
            setFreguesiaResult(0);
        }
    }

    const [distritoResult, setDistritoResult] = useState(0);
    const [requestDistrito, setRequestDistrito] = useState(false);


    const [concelhoResult, setConcelhoResult] = useState(0);
    const [requestConcelho, setRequestConcelho] = useState(false);


    const [freguesiaResult, setFreguesiaResult] = useState(0);
    const [requestFreguesia, setRequestFreguesia] = useState(false);


    return (
        <>

            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área total das parcelas no distrito de: </h4>
                <Form.Group className="mt-3 pie-loc" controlId="pie_distrito">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                        <option disabled={true} value="-">Distritos</option>
                        {distritoList}
                    </Form.Select>
                </Form.Group>

                {requestDistrito?<Spinner animation="border" variant="success" />:<h5 className="stats-admin-title statistics_result"> {distritoResult}m² </h5>}
            </Col>

            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área total das parcelas no concelho de: </h4>
                <Form.Group className="mt-3 pie-loc" controlId="pie_concelho">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                        <option value="-">Concelhos</option>
                        {concelhoOptions}
                    </Form.Select>
                </Form.Group>

                {requestConcelho?<Spinner animation="border" variant="success" />:<h5 className="stats-admin-title statistics_result"> {concelhoResult}m² </h5>}
            </Col>

            <Col className="stats-admin-container">
                <p></p>
                <h4 className="stats-admin-title"> Área total das parcelas na freguesia de: </h4>
                <Form.Group className="mt-3 pie-loc" controlId="pie_freguesia">
                    <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handlesetFreguesia(e.target.value)}>
                        <option value="-">Freguesias</option>
                        {freguesiaOptions}
                    </Form.Select>
                </Form.Group>

                {requestFreguesia?<Spinner animation="border" variant="success" />:<h5 className="stats-admin-title statistics_result"> {freguesiaResult}m² </h5>}
            </Col>
        </>
    );
};


export default NumberLocationStatistics;