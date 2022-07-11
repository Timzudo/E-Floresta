import './Statistics.css'
import React, { useState } from 'react';
import {useEffect} from "react";
import {Spinner, Table} from "react-bootstrap";


const RankingListStatistics = (props) => {

    const [result, setResult] = useState([]);
    const [request, setRequest] = useState(false);

    let type = props.type;
    let labelA = props.labelA;
    let labelB = props.labelB;

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
                        let list = JSON.parse(t);
                        let auxResult = [];
                        for(let i = 0; i<list.length; i++){
                            auxResult.push(<tr>
                                            <td>{i+1}</td>
                                            <td>{list[i].name}</td>
                                            <td>{list[i][type]}</td>
                                           </tr>)
                        }
                        setResult(auxResult);
                    })
                }
                setRequest(false);
            }).catch(() =>setRequest(false));
    }, [])



    return (
        <>
            {request?<Spinner id="spinner_ConfirmationPage" animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
            </Spinner>: <Table id="userTrust_Rankings" striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>{labelA}</th>
                    <th>{labelB}</th>
                </tr>
                </thead>
                <tbody>
                {result}
                </tbody>
            </Table>}
        </>
    );
};


export default RankingListStatistics;