import "./AllParcels.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React, { Component }  from 'react';
import {Button, ButtonGroup, Card, Col, Container, Dropdown, Modal, Row, Spinner} from "react-bootstrap";
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

const AllParcels = () => {
    const navigate = useNavigate();

    const [requested, setRequested] = useState(false);
    const [obj, setObj] = useState({});

    const [paths, setPaths] = useState([]);

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);

    const handleShow = (obj) => {
        console.log("show")
        setObj(obj)
        setShow(true);
        setEditShow(false);
    }

    const handleEditShow = (obj) => {
        console.log("showedit")
        setObj(obj)
        setShow(false);
        setEditShow(true);
    }

    const handleClose = () => setShow(false);
    const handleEditClose = () => setEditShow(false);

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();
    let arr = [];

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    let pathsArr = [];
                    for(let i = 0; i<obj.length; i++){


                        arr.push(<Card className="parcel-card_AllParcels" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture_AllParcels" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} </Card.Title>
                                <Card.Text>
                                    <label className={"w-100 text-truncate"}>Área: {obj[i].area}m²</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].freguesia}>Freguesia: {obj[i].freguesia}</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].concelho}>Concelho: {obj[i].concelho}</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].distrito}>Distrito: {obj[i].distrito}</label>
                                    <Row>
                                        <Col>
                                            <Button id="show-parcel-details_AllParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleShow(obj[i])}>Detalhes</Button>
                                        </Col>
                                        <Col>
                                            <Button id="edit-parcel_AllParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleEditShow(obj[i])}>Editar</Button>
                                        </Col>
                                    </Row>
                                </Card.Text>

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
                else if(xmlhttp.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(xmlhttp.status === 404){
                    alert("Utilizador não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
                setRequested(false);
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/approvedbyregion");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
        setRequested(true);
    }, [])

    return(<>
        <CheckIfLoggedOut />
        <TopBar />

            <LoadScript googleMapsApiKey="AIzaSyC3yXGtu-O5HD8LhlQ18w68dby2HQ2X3O4">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <ParcelEditModal obj={obj} show={editShow} setShow={setEditShow}/>

                <div id="allParcelsBody">

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                        {paths}
                    </GoogleMap>

                    <div className="body_AllParcels">
                        <div className="container_AllParcels">
                            {requested? <Spinner id="spinner_ConfirmationPage" variant="success" animation="border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </Spinner> : parcelList}
                        </div>
                    </div>
                </div>

            </LoadScript>
            
        </>
    )
}

export default AllParcels