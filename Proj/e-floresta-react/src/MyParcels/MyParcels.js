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

const MyParcels = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_MyParcels" style={{ width: '15rem',cursor: "pointer"}} onClick={() => handleShow()}>
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
                                <Link to="/edit-parcel">
                                    <Button id="edit-parcel_MyParcels" variant="primary">Editar Parcela</Button>
                                </Link>
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
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title><h4>Parcela: {"teste"}</h4></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    I will not close if you click outside me. Don't even try to press
                    escape key.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary">Understood</Button>
                </Modal.Footer>
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