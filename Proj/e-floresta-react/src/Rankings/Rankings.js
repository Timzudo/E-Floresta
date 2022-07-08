import './Rankings.css'
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { CDBCard, CDBCardBody, CDBDataTable, CDBContainer } from 'cdbreact';
import Chart from 'chart.js/auto';
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Row} from "react-bootstrap";


const Rankings = () => {

    const userTrust = () => {
        return {
            columns: [
                {
                    label: '#',
                    field: 'number',
                    width: 100,
                },
                {
                    label: 'Username',
                    field: 'username',
                    width: 150,
                    attributes: {
                        'aria-controls': 'DataTable',
                        'aria-label': 'Name',
                    },
                },
                {
                    label: 'Pontos de confiança',
                    field: 'usertrust',
                    width: 100,
                },
            ],
            rows: [
                {
                    number: '1',
                    username: 'tigernixon',
                    usertrust: '98%',
                },
                {
                    number: '2',
                    username: 'garrettwinters',
                    usertrust: '96%',
                },
                {
                    number: '3',
                    username: 'ashtoncox',
                    usertrust: '93%',
                },
                {
                    number: '4',
                    username: 'cedrickelly',
                    usertrust: '90%',
                },
                {
                    number: '5',
                    username: 'airisatou',
                    usertrust: '89%',
                },
                {
                    number: '6',
                    username: 'brielle_williamson',
                    usertrust: '85%',
                },
                {
                    number: '7',
                    username: 'herrod-chandler',
                    usertrust: '84%',
                },
                {
                    number: '8',
                    username: 'rhonaDavidson0',
                    usertrust: '82%',
                },
                {
                    number: '9',
                    username: 'colleen_Hurst',
                    usertrust: '79%',
                },
                {
                    number: '10',
                    username: 'sonyafrost',
                    usertrust: '77%',
                },
            ],
        };
    };


    const biggerArea = () => {
        return {
            columns: [
                {
                    label: '#',
                    field: 'number',
                    width: 100,
                },
                {
                    label: 'Username',
                    field: 'username',
                    width: 150,
                    attributes: {
                        'aria-controls': 'DataTable',
                        'aria-label': 'Name',
                    },
                },
                {
                    label: 'Área total das parcelas (m²)',
                    field: 'area',
                    width: 100,
                },
            ],
            rows: [
                {
                    number: '1',
                    username: 'matilda',
                    area: '3524',
                },
                {
                    number: '2',
                    username: 'cleide',
                    area: '3283',
                },
                {
                    number: '3',
                    username: 'cristiano',
                    area: '2987',
                },
                {
                    number: '4',
                    username: 'josemiro',
                    area: '2745',
                },
                {
                    number: '5',
                    username: 'palmira',
                    area: '2693',
                },
                {
                    number: '6',
                    username: 'santiago',
                    area: '2365',
                },
                {
                    number: '7',
                    username: 'letício',
                    area: '2163',
                },
                {
                    number: '8',
                    username: 'melissa',
                    area: '2013',
                },
                {
                    number: '9',
                    username: 'edgar',
                    area: '2001',
                },
                {
                    number: '10',
                    username: 'sérgio',
                    area: '1963',
                },
            ],
        };
    };


    const mostParcels = () => {
        return {
            columns: [
                {
                    label: '#',
                    field: 'number',
                    width: 100,
                },
                {
                    label: 'Username',
                    field: 'username',
                    width: 150,
                    attributes: {
                        'aria-controls': 'DataTable',
                        'aria-label': 'Name',
                    },
                },
                {
                    label: 'Número total de parcelas',
                    field: 'numParcels',
                    width: 100,
                },
            ],
            rows: [
                {
                    number: '1',
                    username: 'carla',
                    numParcels: '70',
                },
                {
                    number: '2',
                    username: 'clotilde',
                    numParcels: '62',
                },
                {
                    number: '3',
                    username: 'ambrósio',
                    numParcels: '57',
                },
                {
                    number: '4',
                    username: 'gisela',
                    numParcels: '51',
                },
                {
                    number: '5',
                    username: 'jurandir',
                    numParcels: '45',
                },
                {
                    number: '6',
                    username: 'emanuel',
                    numParcels: '41',
                },
                {
                    number: '7',
                    username: 'marcela',
                    numParcels: '38',
                },
                {
                    number: '8',
                    username: 'salomé',
                    numParcels: '34',
                },
                {
                    number: '9',
                    username: 'caio',
                    numParcels: '29',
                },
                {
                    number: '10',
                    username: 'leonel',
                    numParcels: '28',
                },
            ],
        };
    };


    return (
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="rankings-background">

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais pontos de confiança </h2>

                <Row className="rankings-container">
                    <CDBContainer>
                        <CDBCard>
                            <CDBCardBody>
                                <CDBDataTable
                                    striped
                                    bordered
                                    hover
                                    entriesOptions={[5, 10]}
                                    entries={5}
                                    scrollY
                                    maxHeight="30vh"
                                    data={userTrust()}
                                    materialSearch={true}
                                    noRecordsFoundLabel="Não há utilizadores suficientes para gerar um ranking."
                                    paginationLabel={["Anterior", "Próximo"]}
                                />
                            </CDBCardBody>
                        </CDBCard>
                    </CDBContainer>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com maior área de parcelas </h2>

                <Row className="rankings-container">
                    <CDBContainer>
                        <CDBCard>
                            <CDBCardBody>
                                <CDBDataTable
                                    striped
                                    bordered
                                    hover
                                    entriesOptions={[5, 10]}
                                    entries={5}
                                    scrollY
                                    maxHeight="30vh"
                                    data={biggerArea()}
                                    materialSearch={true}
                                    noRecordsFoundLabel="Não há utilizadores suficientes para gerar um ranking."
                                    paginationLabel={["Anterior", "Próximo"]}
                                />
                            </CDBCardBody>
                        </CDBCard>
                    </CDBContainer>
                </Row>

                <p></p>
                <h2 className="rankings-title"> Ranking de utilizadores com mais parcelas registadas</h2>

                <Row className="rankings-container">
                    <CDBContainer>
                        <CDBCard>
                            <CDBCardBody>
                                <CDBDataTable
                                    striped
                                    bordered
                                    hover
                                    entriesOptions={[5, 10]}
                                    entries={5}
                                    scrollY
                                    maxHeight="30vh"
                                    data={mostParcels()}
                                    materialSearch={true}
                                    noRecordsFoundLabel="Não há utilizadores suficientes para gerar um ranking."
                                    paginationLabel={["Anterior", "Próximo"]}
                                />
                            </CDBCardBody>
                        </CDBCard>
                    </CDBContainer>
                </Row>
            </div>

        </>
    );
};


export default Rankings;