import './StatisticsAdmin.css'
import React, { useState } from 'react';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Col, Dropdown, Row, Table} from "react-bootstrap";
import { Pie } from 'react-chartjs-2';
import NumberStatistics from "../util/Statistics/NumberStatistics";
import CheckIfActive from "../util/CheckIfActive";


const StatisticsAdmin = () => {


    const [utilSoloByArea] = useState({
        labels: ['Privado', 'Comercial', 'Pasto', 'Floresta', 'Agrícola', 'Residencial', 'Transporte', 'Recreativo'],
        datasets: [
            {
                label: 'Percentagem por área de parcelas',
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
                data: [200, 50, 150, 50, 300, 40, 200, 10],
            },
        ],
    });


    return (
        <>
            <CheckIfLoggedOut />
            <CheckIfActive />
            <TopBar />

            <div className="statistics-admin-background">
                <Row>
                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área total das parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/areaTotal" label="m²"></NumberStatistics>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Média da área das parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelAvgArea" label="m²"></NumberStatistics>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Perímetro total das parcelas registadas </h4>
                        <h5 className="stats-admin-title statistics_result"> 25963m </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Média do perímetro das parcelas registadas </h4>
                        <h5 className="stats-admin-title statistics_result"> 1204m² </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Número de parcelas registadas </h4>
                        <NumberStatistics url="https://moonlit-oven-349523.appspot.com/rest/statistics/rankings/parcelCount" label=""></NumberStatistics>
                    </Col>
                    <p></p>
                </Row>

                <Row>

                    <p className="stats-admin-paragraph"></p>
                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área total das parcelas no distrito de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 16204m² </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área total das parcelas no concelho de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 1204m² </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área total das parcelas na freguesia de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Freguesia
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Freguesia1</Dropdown.Item>
                                <Dropdown.Item>Freguesia2</Dropdown.Item>
                                <Dropdown.Item>Freguesia3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 204m² </h5>
                    </Col>

                </Row>

                <Row>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Perímetro total das parcelas no distrito de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 16204m </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Perímetro total das parcelas no concelho de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 1204m </h5>
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Perímetro total das parcelas na freguesia de: </h4>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Freguesia
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Freguesia1</Dropdown.Item>
                                <Dropdown.Item>Freguesia2</Dropdown.Item>
                                <Dropdown.Item>Freguesia3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <h5 className="stats-admin-title statistics_result"> 204m </h5>
                    </Col>

                </Row>


                <Row>

                    <p></p>
                    <p className="stats-admin-paragraph" ></p>
                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo no distrito de:</h4>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Pie className="util-solo-byArea_StatsAdmin" data={utilSoloByArea} options={{ responsive: true }} />
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo no concelho de:</h4>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Pie className="util-solo-byArea_StatsAdmin" data={utilSoloByArea} options={{ responsive: true }} />
                    </Col>

                    <Col className="stats-admin-container">
                        <p></p>
                        <h4 className="stats-admin-title"> Área das parcelas por tipo de utilização do solo na freguesia de:</h4>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                                Freguesia
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Freguesia1</Dropdown.Item>
                                <Dropdown.Item>Freguesia2</Dropdown.Item>
                                <Dropdown.Item>Freguesia3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Pie className="util-solo-byArea_StatsAdmin" data={utilSoloByArea} options={{ responsive: true }} />
                    </Col>

                </Row>

                <p></p>
                <p className="stats-admin-paragraph"></p>
                <h2 className="rankings-title_StatsAdmin"> Ranking de distritos com mais parcelas registadas </h2>

                <Row className="rankings-container_StatsAdmin">
                    <Col>
                        <Table id="mostParcelsNrDist_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Distrito</th>
                                <th>Número de parcelas</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Beja</td>
                                <td>3524</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Évora</td>
                                <td>3283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Faro</td>
                                <td>2987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Viseu</td>
                                <td>2745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Vila Real</td>
                                <td>2693</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                    <Col>
                        <Table id="mostParcelsAreaDist_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Distrito</th>
                                <th>Área total de parcelas (m²)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Évora</td>
                                <td>9524</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Beja</td>
                                <td>9283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Viseu</td>
                                <td>8987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Faro</td>
                                <td>7745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Vila Real</td>
                                <td>5693</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                </Row>


                <p></p>
                <h2 className="rankings-title_StatsAdmin"> Ranking de concelhos com mais parcelas registadas </h2>

                <Row className="rankings-container_StatsAdmin">
                    <Col>
                        <Table id="mostParcelsNrConc_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Concelho</th>
                                <th>Número de parcelas</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Sintra</td>
                                <td>1198</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Vila Nova de Gaia</td>
                                <td>1025</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Vila Franca de Xira</td>
                                <td>2987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Viseu</td>
                                <td>1941</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>1852</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                    <Col>
                        <Table id="mostParcelsAreaDist_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Distrito</th>
                                <th>Área total de parcelas (m²)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Vila Nova de Gaia</td>
                                <td>9524</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Viseu</td>
                                <td>9283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Sintra</td>
                                <td>8987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Vila Franca de Xira</td>
                                <td>7745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>5693</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                </Row>


                <p></p>
                <h2 className="rankings-title_StatsAdmin"> Ranking de concelhos no distrito de: </h2>

                <Row className="rankings-container_StatsAdmin">
                    <Col>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-rankings_StatsAdmin">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Table id="rankingConcNum_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Concelho</th>
                                <th>Número de parcelas</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Sintra</td>
                                <td>1198</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Vila Nova de Gaia</td>
                                <td>1025</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Vila Franca de Xira</td>
                                <td>2987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Viseu</td>
                                <td>1941</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>1852</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                    <Col>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-rankings_StatsAdmin">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Distrito1</Dropdown.Item>
                                <Dropdown.Item>Distrito2</Dropdown.Item>
                                <Dropdown.Item>Distrito3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Table id="rankingConcArea_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Distrito</th>
                                <th>Área total de parcelas (m²)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Vila Nova de Gaia</td>
                                <td>9524</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Viseu</td>
                                <td>9283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Sintra</td>
                                <td>8987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Vila Franca de Xira</td>
                                <td>7745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>5693</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                </Row>


                <p></p>
                <h2 className="rankings-title_StatsAdmin"> Ranking de freguesias no concelho de: </h2>

                <Row className="rankings-container_StatsAdmin">
                    <Col>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-rankings_StatsAdmin">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Table id="rankingFregNum_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Freguesia</th>
                                <th>Número de parcelas</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Sintra</td>
                                <td>1198</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Vila Nova de Gaia</td>
                                <td>1025</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Vila Franca de Xira</td>
                                <td>2987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Viseu</td>
                                <td>1941</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>1852</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                    <Col>

                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-rankings_StatsAdmin">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Table id="rankingFregArea_StatsAdmin" striped bordered hover>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Freguesia</th>
                                <th>Área total de parcelas (m²)</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Vila Nova de Gaia</td>
                                <td>9524</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Viseu</td>
                                <td>9283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Sintra</td>
                                <td>8987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Vila Franca de Xira</td>
                                <td>7745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Barcelos</td>
                                <td>5693</td>
                            </tr>
                            </tbody>
                        </Table>
                    </Col>

                </Row>


            </div>

        </>
    );
}

export default StatisticsAdmin;