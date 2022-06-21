import "./MyParcels.css"
import Image from './terreno.png'

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Badge, Button, Card, Modal} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useEffect, useState} from 'react'
import React, { Component }  from 'react';
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";

const containerStyle = {
    width: '75vw',
    height: '93.5vh'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const modalContainerStyle = {
    width: '72vw',
    height: '45vh'
};


const MyParcels = () => {
    const [obj, setObj] = useState({});

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const handleShow = () => {
        setShow(true);
        setEditShow(false);
    }
    const handleEditShow = () => {
        setShow(false);
        setEditShow(true);
    }
    const handleClose = () => setShow(false);
    const handleEditClose = () => setEditShow(false);

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();

    let arr = [];
    let verified = false;

    function isParcelVerified(verified) {
        if(verified) {
            return(
                <Badge pill bg="success">Verificada</Badge>
            )
        }
        else{
            return(
                <Badge pill bg="secondary">Por verificar</Badge>
            )
        }
    }

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    setObj(obj);
                }
            }
        }
        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_MyParcels" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} {isParcelVerified(obj[i].isApproved)} </Card.Title>
                                <Card.Text>
                                    <label>Área: {obj[i].area}m²</label><br/>
                                    <label>Perímetro: {obj[i].perimeter}m</label><br/>
                                    <label>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label>Concelho: {obj[i].concelho}</label><br/>
                                    <label>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                    <Button id="show-parcel-details_MyParcels" variant="primary" size="sm" onClick={() => handleShow()}>Ver detalhes</Button>
                                    <p></p>
                                    <Button id="edit-parcel_MyParcels" variant="primary" size="sm" onClick={() => handleEditShow()}>Editar Parcela</Button>
                                </Card.Body>

                        </Card>);
                    }
                    setPList(arr);
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/owned");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    })

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <Modal
                onShow={loadModalValues}
                show={show}
                onHide={handleClose}
                backdrop="static"
                dialogClassName="modal-xl"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title> Parcela: {obj.name} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <GoogleMap
                        mapContainerStyle={modalContainerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                    </GoogleMap>
                </Modal.Body>
                <Modal.Body>
                    <Button variant="success">Ver parcelas próximas</Button><br/>
                    <p></p>
                    <label><b>Proprietário:</b> {obj.owner}</label><br/>
                    <label><b>Gerente:</b> {obj.manager}</label><br/>
                    <label><b>Freguesia:</b> {obj.freguesia}</label><br/>
                    <label><b>Concelho:</b> {obj.concelho}</label><br/>
                    <label><b>Distrito:</b> {obj.distrito}</label><br/>
                    <label><b>Área da parcela:</b> {obj.area}m²</label><br/>
                    <label><b>Perímetro da parcela:</b> {obj.perimeter}m</label><br/>
                    <label><b>Descrição:</b> {obj.description}</label><br/>
                    <label><b>Tipo de cobertura do solo:</b> {obj.tipoSolo}</label><br/>
                    <label><b>Utilização atual do solo:</b> {obj.soloUtil}</label><br/>
                    <label><b>Utilização prévia do solo:</b> {obj.oldSoloUtil}</label><br/>
                </Modal.Body>
            </Modal>


            <Modal
                onShow={loadModalValues}
                show={editShow}
                onHide={handleEditClose}
                backdrop="static"
                dialogClassName="modal-xl"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title> Parcela: {obj.name} <input type="text" /> </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p></p>
                    <label><b>Proprietário:</b> {obj.owner}</label><br/>
                    <label><b>Gerente:</b> {obj.manager}</label><br/>
                    <label><b>Freguesia:</b> {obj.freguesia}</label><br/>
                    <label><b>Concelho:</b> {obj.concelho}</label><br/>
                    <label><b>Distrito:</b> {obj.distrito}</label><br/>
                    <label><b>Área da parcela:</b> {obj.area}m²</label><br/>
                    <label><b>Perímetro da parcela:</b> {obj.perimeter}m</label><br/>
                    <label><b>Descrição:</b> {obj.description} <input type="text" /> </label><br/>
                    <label><b>Tipo de cobertura do solo:</b> {obj.tipoSolo}</label><br/>
                    <label><b>Utilização atual do solo:</b> {obj.soloUtil}</label><br/>
                    <label><b>Utilização prévia do solo:</b> {obj.oldSoloUtil}</label><br/>
                </Modal.Body>
            </Modal>

            <div id="myParcelsBody">
                <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                    </GoogleMap>
                </LoadScript>

                <div className="body_MyParcels">
                    <div className="container_MyParcels">
                        {parcelList}
                    </div>
                </div>
            </div>
        </>
    )
}

export default MyParcels