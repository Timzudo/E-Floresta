import "./MyParcels.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Badge, Button, Card, Col, Row, Spinner} from "react-bootstrap";
import {useEffect, useState} from 'react'
import React from 'react';
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";
import ParcelNearbyModal from "../util/ParcelNearbyModal/ParcelNearbyModal";
import {useNavigate} from "react-router-dom";
import CheckIfActive from "../util/CheckIfActive";

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
    fillOpacity: 0.2,
    strokeColor: "DarkOrange",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}


const MyParcels = () => {
    const navigate = useNavigate();

    const [requested, setRequested] = useState(false);
    const [obj, setObj] = useState({});

    const [paths, setPaths] = useState([]);

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [nearbyShow, setNearbyShow] = useState(false);

    const handleShow = (obj) => {
        setObj(obj);
        setShow(true);
        setEditShow(false);
        setNearbyShow(false);
    }
    const handleEditShow = (obj) => {
        setObj(obj);
        setShow(false);
        setEditShow(true);
        setNearbyShow(false);
    }
    const handleNearbyShow = (obj) => {
        setObj(obj);
        setShow(false);
        setEditShow(false);
        setNearbyShow(true);
    }

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();

    let arr = [];
    let pathsArr = [];

    function isParcelVerified(verified) {
        if(verified === "APPROVED") {
            return(
                <Badge pill bg="success">Verificada</Badge>
            )
        }
        else if(verified === "REJECTED") {
            return(
                <Badge pill bg="danger">Rejeitada</Badge>
            )
        }
        else{
            return(
                <Badge pill bg="secondary">Por verificar</Badge>
            )
        }
    }


    function topFunction() {
        document.getElementById("body_MyParcels").scrollTop = 0;
    }


    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_MyParcels" style={{ width: '15rem',cursor: "default"}}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} {isParcelVerified(obj[i].isApproved)} </Card.Title>
                                <Card.Text>
                                    <label className={"w-100 text-truncate"}>Área: {obj[i].area}m²</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].freguesia}>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].concelho}>Concelho: {obj[i].concelho}</label><br/>
                                    <label className={"w-100 text-truncate"} title={obj[i].distrito}>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                    <Row>
                                        <Col>
                                            <Button id="show-parcel-details_MyParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleShow(obj[i])}>Detalhes</Button>
                                        </Col>
                                        <Col>
                                            <Button id="edit-parcel_MyParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleEditShow(obj[i])}>Editar</Button>
                                        </Col>
                                        <Col>
                                            <Button id="nearby-parcel_MyParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleNearbyShow(obj[i])}>Parcelas Próximas</Button>
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

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/owned");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
        setRequested(true);

    }, [])


    return(
        <>
            <CheckIfLoggedOut />
            <CheckIfActive />
            <TopBar />

            <LoadScript googleMapsApiKey="AIzaSyC3yXGtu-O5HD8LhlQ18w68dby2HQ2X3O4">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <ParcelEditModal obj={obj} show={editShow} setShow={setEditShow}/>

                <ParcelNearbyModal obj={obj} show={nearbyShow} setShow={setNearbyShow}/>

                <div id="myParcelsBody">

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                        {paths}
                    </GoogleMap>

                    <div className="body_MyParcels" id="body_MyParcels">
                        <div className="container_MyParcels" id="container_MyParcels">
                            {requested? <Spinner id="spinner_ConfirmationPage" variant="success" animation="border" role="status">
                                <span className="visually-hidden">Carregando...</span>
                            </Spinner> : parcelList}
                        </div>
                    </div>
                </div>

            </LoadScript>

            <button onClick={() => topFunction()} id="backToTop" title="Go to top">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor"
                     className="bi bi-arrow-up" viewBox="0 0 16 16">
                    <path fillRule="evenodd"
                          d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                </svg>
                </button>

        </>
    )
}

export default MyParcels