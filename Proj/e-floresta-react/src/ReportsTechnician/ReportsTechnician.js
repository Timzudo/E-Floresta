import "./ReportsTechnician.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React, {useEffect, useState} from 'react'
import {Button, Card, Col, Row} from "react-bootstrap";
import {Polygon} from "@react-google-maps/api";


const ReportsTechnician = () => {

    const [reportList, setReportList] = useState([]);
    useEffect(() => {
        console.log("yau?");
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };
        
        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/getreportsAll", options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => {
                        let arr = JSON.parse(t);
                        for(let i = 0; i<arr.length; i++){
                            arr.push(
                                <Row>
                                    <Card border="dark" style={{ width: '85%', cursor: 'pointer'}}>
                                    <Card.Header><b>ReportID: {arr[i].reportID}</b></Card.Header>
                                    <Card.Header>Prioridade: {arr[i].priority}</Card.Header>
                                    <Card.Body>
                                        <Card.Title>Tópico: {arr[i].topic}</Card.Title>
                                        <p></p>
                                        <Card.Text>
                                            <Row>
                                                <Col>
                                                    <h6> Nome da Parcela: {arr[i].parcelName}</h6>
                                                    <h6> Autor: {arr[i].sender}</h6>
                                                    <h6> Distrito: {arr[i].distrito}</h6>
                                                    <h6> Concelho: {arr[i].concelho}</h6>
                                                    <h6> Freguesia: {arr[i].freguesia}</h6>
                                                </Col>
                                                <Col>
                                                    <h6> Mensagem: {arr[i].mesage}</h6>
                                                </Col>
                                            </Row>
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Row>
                                            <Col>
                                                <Button id="confirm-report_ReportsTechnician">Confirmar</Button>
                                            </Col>
                                            <Col>
                                                <Button id="ignore-report_ReportsTechnician">Ignorar</Button>
                                            </Col>
                                            <Col>
                                                <Button id="decline-report_ReportsTechnician">Declinar</Button>
                                            </Col>
                                        </Row>
                                    </Card.Footer>
                                </Card>
                            </Row>)
                        }
                        setReportList(arr);
                    })
                }
            }).catch(console.log);
    }, [])

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="ReportsTechnicianBody">
                {reportList}
            </div>
        </>
    )
}

export default ReportsTechnician