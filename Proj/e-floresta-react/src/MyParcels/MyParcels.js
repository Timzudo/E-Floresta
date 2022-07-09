import "./MyParcels.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Badge, Button, Card, Col, Row} from "react-bootstrap";
import {useEffect, useState} from 'react'
import React from 'react';
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";
import ParcelNearbyModal from "../util/ParcelNearbyModal/ParcelNearbyModal";

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
    const [obj, setObj] = useState({});

    const [paths, setPaths] = useState([]);

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [nearbyShow, setNearbyShow] = useState(false);

    const handleShow = (obj) => {
        console.log("show")
        setObj(obj);
        setShow(true);
        setEditShow(false);
        setNearbyShow(false);
    }
    const handleEditShow = (obj) => {
        console.log("showedit")
        setObj(obj);
        setShow(false);
        setEditShow(true);
        setNearbyShow(false);
    }
    const handleNearbyShow = (obj) => {
        console.log("shownearby")
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
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/owned");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])


    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">

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

                    <div className="body_MyParcels">
                        <div className="container_MyParcels">
                            {parcelList}
                        </div>
                    </div>
                </div>

            </LoadScript>

        </>
    )
}

export default MyParcels