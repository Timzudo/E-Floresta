import "./ParcelsEntity.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Badge, Button, ButtonGroup, Card, Col, Dropdown, Modal, Row} from "react-bootstrap";
import {useEffect, useState} from 'react'
import React from 'react';
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";
import {useNavigate} from "react-router-dom";


const containerStyle = {
    width: '75vw',
    height: '93.5vh'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const options = {
    fillColor: "Khaki",
    fillOpacity: 0.3,
    strokeColor: "DarkOrange",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}


const ParcelsEntity = () => {
    const navigate = useNavigate();
    const [obj, setObj] = useState({});

    const [paths, setPaths] = useState([]);

    const [show, setShow] = useState(false);

    const handleShow = (obj) => {
        console.log("show")
        setObj(obj);
        setShow(true);
    }

    const handleClose = () => setShow(false);

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();

    let arr = [];
    let pathsArr = [];

    function removeManager(parcelName, owner){
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    navigate("/parcels-entity");
                }
            }
        }
        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/removemanager/" + owner + "_" + parcelName);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }


    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_ParcelsEntity" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} </Card.Title>
                                <Card.Text>
                                    <label className={"w-100 text-truncate"}>Área: {obj[i].area}m²</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].freguesia}>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].concelho}>Concelho: {obj[i].concelho}</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].distrito}>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                <Row>
                                    <Col>
                                        <Button id="show-parcel-details_ParcelsEntity" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleShow(obj[i])}>Detalhes</Button>
                                    </Col>
                                    </Row>
                                <Row>
                                    <Col>
                                        <Button id="remove-parcel_ParcelsEntity" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => removeManager(obj[i].name, obj[i].owner)}>Remover</Button>
                                    </Col>
                                    <Col>
                                        <Button id="report-parcel_ProposedParcelsEntity" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => navigate("/make-report?id=" + obj[i].owner + "_" + obj[i].name)}>Reportar</Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>);

                        pathsArr.push(
                            <Polygon
                                paths={JSON.parse(obj[i].coordinates)}
                                options={options}
                            />
                        );
                    }
                    setPList(arr);
                    setPaths(pathsArr);
                }
            }
        }

        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/managed");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])


    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <div id="ParcelsEntityBody">

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                        {paths}
                    </GoogleMap>

                    <div className="body_ParcelsEntity">
                        <div className="container_ParcelsEntity">
                            {parcelList}
                        </div>
                    </div>
                </div>

            </LoadScript>

        </>
    )
}

export default ParcelsEntity