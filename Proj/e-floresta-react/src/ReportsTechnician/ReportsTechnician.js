import "./ReportsTechnician.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React, {useEffect, useState} from 'react'
import {Button, Card, Col, Row, Spinner} from "react-bootstrap";
import {Polygon} from "@react-google-maps/api";
import {useNavigate} from "react-router-dom";


const ReportsTechnician = () => {
    const navigate = useNavigate();

    const [requested, setRequested] = useState(false);
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
                        let auxArr = [];
                        for(let i = 0; i<arr.length; i++){
                            auxArr.push(
                                <Row>
                                    <Card border="dark" style={{ width: '85%', cursor: 'pointer'}}>
                                    <Card.Header><b>Autor: {arr[i].sender}</b></Card.Header>
                                    <Card.Header>Prioridade: {arr[i].priority}</Card.Header>
                                    <Card.Body>
                                        <Card.Title>Tópico: {arr[i].topic}</Card.Title>
                                        <p></p>
                                        <Card.Text>
                                            <Row>
                                                <Col>
                                                    <h6> Nome da Parcela: {arr[i].parcelName}</h6>
                                                    <h6> Distrito: {arr[i].distrito}</h6>
                                                    <h6> Concelho: {arr[i].concelho}</h6>
                                                    <h6> Freguesia: {arr[i].freguesia}</h6>
                                                </Col>
                                                <Col>
                                                    <h6>{arr[i].message}</h6>
                                                </Col>
                                            </Row>
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <Row>
                                            <Col>
                                                <Button onClick={() => reviewReport(arr[i].reportID, "POSITIVE")} id="confirm-report_ReportsTechnician">Confirmar</Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={() => reviewReport(arr[i].reportID, "NEUTRAL")} id="ignore-report_ReportsTechnician">Ignorar</Button>
                                            </Col>
                                            <Col>
                                                <Button onClick={() => reviewReport(arr[i].reportID, "NEGATIVE")} id="decline-report_ReportsTechnician">Rejeitar</Button>
                                            </Col>
                                        </Row>
                                    </Card.Footer>
                                </Card>
                            </Row>)
                        }
                        setReportList(auxArr);
                    })
                }
                else if(r.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404){
                    alert("O proprietário não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            }).catch(console.log);
    }, [])

    function reviewReport(reportID, opinion){
        let myObj = {token:localStorage.getItem('token'),
                        opinion:opinion};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/review/"+reportID, options)
            .then((r) => {
                if(r.ok){
                    alert("Success");
                    window.location.reload();
                }
                else if(r.status === 400) {
                    alert("Todos os campos devem ser preenchidos corretamente.");
                }
                else if(r.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404) {
                    alert("O proprietário ou a parcela não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            }).catch(()=>(console.log));
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="ReportsTechnicianBody">
                {requested? <Spinner id="spinner_ConfirmationPage" variant="success" animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner> : reportList}
            </div>
        </>
    )
}

export default ReportsTechnician