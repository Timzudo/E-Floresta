import "./AllParcelsAdmin.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React from 'react';
import {Button, Card, Col, Dropdown, Row} from "react-bootstrap";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";
import {GoogleMap, LoadScript} from "@react-google-maps/api";

const containerStyle = {
    width: '75vw',
    height: '93.5vh'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const AllParcelsAdmin = () => {

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
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){


                        arr.push(<Card className="parcel-card_AllParcelsAdmin" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture_AllParcelsAdmin" variant="top" src={obj[i].photoURL} />
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
                    }
                    setPList(arr);
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/approvedbyregion");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])

    return(<>
        <CheckIfLoggedOut />
        <TopBar />

            <div className="buttons_AllParcelsAdmin">
                <Row>
                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown-distrito_AllParcelsAdmin">
                                Distrito
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item> Distrito1 </Dropdown.Item>
                                <Dropdown.Item> Distrito2 </Dropdown.Item>
                                <Dropdown.Item> Distrito3 </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown-concelho_AllParcelsAdmin">
                                Concelho
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Concelho1</Dropdown.Item>
                                <Dropdown.Item>Concelho2</Dropdown.Item>
                                <Dropdown.Item>Concelho3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown-freg_AllParcelsAdmin">
                                Freguesia
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item>Freguesia1</Dropdown.Item>
                                <Dropdown.Item>Freguesia2</Dropdown.Item>
                                <Dropdown.Item>Freguesia3</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>

                    <Col>
                        <Button id="search_AllParcelsAdmin" variant="success">Procurar</Button>
                    </Col>

                </Row>
            </div>


            <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <ParcelEditModal obj={obj} show={editShow} setShow={setEditShow}/>

                <div id="allParcelsAdminBody">

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                        {paths}
                    </GoogleMap>

                    <div className="body_AllParcelsAdmin">
                        <div className="container_AllParcelsAdmin">
                            {parcelList}
                        </div>
                    </div>
                </div>

            </LoadScript>

        </>
    )

}

export default AllParcelsAdmin