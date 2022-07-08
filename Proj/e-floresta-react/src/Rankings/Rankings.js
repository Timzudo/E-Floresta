import './Rankings.css'
import React, { useState } from 'react';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Row, Table} from "react-bootstrap";


const Rankings = () => {


    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="rankings-background">

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais pontos de confiança </h2>

                <Row className="rankings-container">
                    <Table id="userTrust_Rankings" striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Pontos de confiança</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>tigernixon</td>
                                <td>98%</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>garrettwinters</td>
                                <td>96%</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>ashtoncox</td>
                                <td>93%</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>cedrickelly</td>
                                <td>90%</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>airisatou</td>
                                <td>89%</td>
                            </tr>
                        </tbody>
                    </Table>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com maior área de parcelas </h2>

                <Row className="rankings-container">
                    <Table id="biggerArea_Rankings" striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Área total das parcelas (m²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>matilda</td>
                                <td>3524</td>
                            </tr>
                                <tr>
                                <td>2</td>
                                <td>cleide</td>
                                <td>3283</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>cristiano</td>
                                <td>2987</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>josemiro</td>
                                <td>2745</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>palmira</td>
                                <td>2693</td>
                            </tr>
                        </tbody>
                    </Table>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais parcelas registadas</h2>

                <Row className="rankings-container">
                    <Table id="mostParcels_Rankings" striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Número total de parcelas</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>carla</td>
                                <td>70</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>clotilde</td>
                                <td>62</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>ambrósio</td>
                                <td>57</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>gisela</td>
                                <td>51</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>jurandir</td>
                                <td>45</td>
                            </tr>
                        </tbody>
                    </Table>
                </Row>
            </div>

        </>
    );
};


export default Rankings;