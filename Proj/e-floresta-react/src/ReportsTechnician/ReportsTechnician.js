import "./ReportsTechnician.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React from 'react'
import {Button, Card, Col, Row} from "react-bootstrap";


const ReportsTechnician = () => {

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="ReportsTechnicianBody">
                <Row>
                    <Card border="dark" style={{ width: '85%', cursor: 'pointer' }}>
                        <Card.Header><b>ReportID: 1</b></Card.Header>
                        <Card.Header>Prioridade:</Card.Header>
                        <Card.Body>
                            <Card.Title>Tópico:</Card.Title>
                            <p></p>
                            <Card.Text>
                                <h6> Nome da Parcela: </h6>
                                <h6> Autor: </h6>
                                <h6> Distrito: </h6>
                                <h6> Concelho: </h6>
                                <h6> Freguesia: </h6>
                                <h6> Mensagem: </h6>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsTechnician">Aceitar</Button>
                                </Col>
                                <Col>
                                    <Button id="reject-report_ReportsTechnician">Rejeitar</Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Row>

                <Row>
                    <Card border="dark" style={{ width: '85%', cursor: 'pointer' }}>
                        <Card.Header><b>ReportID: 2</b></Card.Header>
                        <Card.Header>Prioridade:</Card.Header>
                        <Card.Body>
                            <Card.Title>Tópico:</Card.Title>
                            <p></p>
                            <Card.Text>
                                <h6> Nome da Parcela: </h6>
                                <h6> Autor: </h6>
                                <h6> Distrito: </h6>
                                <h6> Concelho: </h6>
                                <h6> Freguesia: </h6>
                                <h6> Mensagem: </h6>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsTechnician">Aceitar</Button>
                                </Col>
                                <Col>
                                    <Button id="reject-report_ReportsTechnician">Rejeitar</Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Row>

                <Row>
                    <Card border="dark" style={{ width: '85%', cursor: 'pointer' }}>
                        <Card.Header><b>ReportID: 3</b></Card.Header>
                        <Card.Header>Prioridade:</Card.Header>
                        <Card.Body>
                            <Card.Title>Tópico:</Card.Title>
                            <p></p>
                            <Card.Text>
                                <h6> Nome da Parcela: </h6>
                                <h6> Autor: </h6>
                                <h6> Distrito: </h6>
                                <h6> Concelho: </h6>
                                <h6> Freguesia: </h6>
                                <h6> Mensagem: </h6>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsTechnician">Aceitar</Button>
                                </Col>
                                <Col>
                                    <Button id="reject-report_ReportsTechnician">Rejeitar</Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Row>

            </div>
        </>
    )
}

export default ReportsTechnician