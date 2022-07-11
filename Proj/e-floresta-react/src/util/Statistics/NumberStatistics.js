import './Statistics.css'
import React, { useState } from 'react';
import {useEffect} from "react";
import {Spinner} from "react-bootstrap";


const NumberStatistics = (props) => {

    const [result, setResult] = useState(0);
    const [request, setRequest] = useState(false);

    let label = props.label;

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
                        setResult(t);
                    })
                }
                setRequest(false);
            }).catch(() =>setRequest(false));
    }, [])



    return (
        <>
            {request?<Spinner id="spinner_ConfirmationPage" animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
            </Spinner>: <h5 className="stats-title statistics_result"> {result + " " +label} </h5>}
        </>
    );
};


export default NumberStatistics;