import "./ReportsAdmin.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React from 'react'
import {Button, Card, Col, Dropdown, Row} from "react-bootstrap";


const ReportsAdmin = () => {

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="ReportsAdminBody">

                <Row>
                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown1_ReportsAdmin">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown2_ReportsAdmin">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown3_ReportsAdmin">
                                Freguesia
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Freguesia1</Dropdown.Item>
                                <Dropdown.Item>Freguesia2</Dropdown.Item>
                                <Dropdown.Item>Freguesia3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                <Row>
                    <Card border="dark" style={{ width: '85%', cursor: 'pointer' }}>
                        <Card.Header><b>ReportID: 1</b></Card.Header>
                        <Card.Header>Prioridade:</Card.Header>
                        <Card.Body>
                            <Card.Title>Tópico:</Card.Title>
                            <p></p>
                            <Card.Text>
                                <Row>
                                    <Col>
                                        <h6> Nome da Parcela: </h6>
                                        <h6> Autor: </h6>
                                        <h6> Distrito: </h6>
                                        <h6> Concelho: </h6>
                                        <h6> Freguesia: </h6>
                                    </Col>
                                    <Col>
                                        <h6> Mensagem: </h6>
                                    </Col>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsAdmin">Confirmar</Button>
                                </Col>
                                <Col>
                                    <Button id="ignore-report_ReportsAdmin">Ignorar</Button>
                                </Col>
                                <Col>
                                    <Button id="decline-report_ReportsAdmin">Declinar</Button>
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
                                <Row>
                                    <Col>
                                        <h6> Nome da Parcela: </h6>
                                        <h6> Autor: </h6>
                                        <h6> Distrito: </h6>
                                        <h6> Concelho: </h6>
                                        <h6> Freguesia: </h6>
                                    </Col>
                                    <Col>
                                        <h6> Mensagem: </h6>
                                    </Col>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsAdmin">Confirmar</Button>
                                </Col>
                                <Col>
                                    <Button id="ignore-report_ReportsAdmin">Ignorar</Button>
                                </Col>
                                <Col>
                                    <Button id="decline-report_ReportsAdmin">Declinar</Button>
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
                                <Row>
                                    <Col>
                                        <h6> Nome da Parcela: </h6>
                                        <h6> Autor: </h6>
                                        <h6> Distrito: </h6>
                                        <h6> Concelho: </h6>
                                        <h6> Freguesia: </h6>
                                    </Col>
                                    <Col>
                                        <h6> Mensagem: </h6>
                                    </Col>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col>
                                    <Button id="confirm-report_ReportsAdmin">Confirmar</Button>
                                </Col>
                                <Col>
                                    <Button id="ignore-report_ReportsAdmin">Ignorar</Button>
                                </Col>
                                <Col>
                                    <Button id="decline-report_ReportsAdmin">Declinar</Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Row>

            </div>
        </>
    )
}

export default ReportsAdmin