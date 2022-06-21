import "./ProposedParcelsEntity.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React, { Component }  from 'react';
import {Button, ButtonGroup, Card, Modal} from "react-bootstrap";
import {GoogleMap, LoadScript} from "@react-google-maps/api";

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const modalContainerStyle = {
    width: '72vw',
    height: '45vh'
};

const ProposedParcelsEntity = () => {
    const [obj, setObj] = useState({});

    const [show, setShow] = useState(false);
    const handleShow = () => {
        console.log("show")
        setShow(true);
    }
    const handleClose = () => setShow(false);

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();
    let arr = [];

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

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo"); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_ProposedParcelsEntity" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} </Card.Title>
                                <Card.Text>
                                    <label>Área: {obj[i].area}m²</label><br/>
                                    <label>Perímetro: {obj[i].perimeter}m</label><br/>
                                    <label>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label>Concelho: {obj[i].concelho}</label><br/>
                                    <label>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                <Button id="show-parcel-details_ProposedParcelsEntity" variant="primary" size="sm" onClick={() => handleShow()}>Ver detalhes</Button>
                                <p></p>
                                <Button id="confirm-parcel_ProposedParcelsEntity" variant="primary" size="sm">Aceitar gerenciamento</Button>
                                <p></p>
                                <Button id="reject-parcel_ProposedParcelsEntity" variant="primary" size="sm">Rejeitar gerenciamento</Button>
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

                    <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">
                        <GoogleMap
                            mapContainerStyle={modalContainerStyle}
                            center={center}
                            zoom={10}
                            tilt={0}
                        >
                        </GoogleMap>
                    </LoadScript>

                </Modal.Body>

                <Modal.Body>
                    <label> <b>Proprietário:</b> {obj.owner} </label> <br/>
                    <label> <b>Gerente:</b> {obj.manager} </label> <br/>
                    <label> <b>Freguesia:</b> {obj.freguesia} </label> <br/>
                    <label> <b>Concelho:</b> {obj.concelho} </label> <br/>
                    <label> <b>Distrito:</b> {obj.distrito} </label> <br/>
                    <label> <b>Área da parcela:</b> {obj.area}m² </label> <br/>
                    <label> <b>Perímetro da parcela:</b> {obj.perimeter}m </label> <br/>
                    <label> <b>Descrição:</b> {obj.description} </label> <br/>
                    <label> <b>Tipo de cobertura do solo:</b> {obj.tipoSolo} </label> <br/>
                    <label> <b>Utilização atual do solo:</b> {obj.soloUtil} </label> <br/>
                    <label> <b>Utilização prévia do solo:</b> {obj.oldSoloUtil} </label> <br/>
                </Modal.Body>
            </Modal>

            <div className="proposedParcelsEntityBody">
                <div className="container_ProposedParcelsEntity">
                    {parcelList}
                </div>
            </div>
        </>
    )
}

export default ProposedParcelsEntity