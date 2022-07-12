import  './AboutUs.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React, { Component }  from 'react';
import {Card, Col, Row} from "react-bootstrap";

const AboutUs = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_AboutUs">
                <div className="body_AboutUs">
                    <div className="title_AboutUs">
                        <br/>
                        <h1><b>Equipa Portugal É Floresta!</b></h1>
                    </div>

                    <div className="initial-text_AboutUs">
                        <p>
                            O interior de Portugal está a viver um processo de desertificação populacional provocado pelo movimento
                            dos mais jovens para o litoral e pelo envelhecimento da população com graves consequências económicas,
                            sociais e ambientais.
                        </p>
                        <p>
                            Em particular, a gestão da floresta torna-se incomportável, dando origem a perdas
                            económicas e ambientais resultantes dos incêndios florestais. Assim, a autarquia de Mação pretende
                            reordenar o seu território liderando uma iniciativa que promove a gestão integrada dos terrenos florestais
                            para ganhar escala e reduzir custos.
                        </p>
                        <p> Com vista a resolver este problema, criamos esta plataforma web: E-Floresta, que permite registar a adesão voluntária
                            dos proprietários a esta iniciativa comunitária e, posteriormente, seguir a sua gestão em termos de custos e proveitos.
                        </p>
                    </div>

                    <div className="title2_AboutUs">
                        <br/>
                        <h1><b>Membros da Equipa</b></h1>
                        <br/>
                    </div>

                    <Row>
                        <Col>
                            <Card style={{ width: '21rem' }}>
                                <h3 id="card1-name_AboutUs"><b>Martim Gouveia</b></h3>
                                <Card.Body>
                                    <Card.Title id="card-title_AboutUs">3º Ano de Engenharia Informática</Card.Title>
                                    <p id="card-p_AboutUs">Nova School Of Science & Technology</p>
                                    <Card.Text id="card1-text_AboutUs">Email: ms.gouveia@campus.fct.unl.pt</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card style={{ width: '21rem' }}>
                                <h3 id="card2-name_AboutUs"><b>Raquel Melo</b></h3>
                                <Card.Body>
                                    <Card.Title id="card-title_AboutUs">3º Ano de Engenharia Informática</Card.Title>
                                    <p id="card-p_AboutUs">Nova School Of Science & Technology</p>
                                    <Card.Text id="card2-text_AboutUs">Email: rc.melo@campus.fct.unl.pt</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

        </>
    )
}
export default AboutUs