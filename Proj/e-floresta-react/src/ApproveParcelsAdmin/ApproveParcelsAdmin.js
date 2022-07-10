import "./ApproveParcelsAdmin.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React from 'react';
import {Button, Card, Col, Dropdown, Row} from "react-bootstrap";
import {LoadScript} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";


const ApproveParcelsAdmin = () => {
    const [obj, setObj] = useState({});

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

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();
    let arr = [];

    function approveParcel(parcel) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Parcel approved successfully");
                    window.location.reload();
                }
            }
        }
        let myObj = {
            token: localStorage.getItem('token'),
        };
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/approve/"+parcel.owner+"_"+parcel.name); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    function rejectParcel(parcel) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Parcel approved successfully");
                    window.location.reload();
                }
            }
        }
        let myObj = {
            token: localStorage.getItem('token'),
        };
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/reject/"+parcel.owner+"_"+parcel.name); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_ApproveParcelsAdmin" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture_ApproveParcelsAdmin" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name} </Card.Title>
                                <Card.Text>
                                    <label className={"w-100 text-truncate"}>Área: {obj[i].area}m²</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].freguesia}>Freguesia: {obj[i].freguesia}</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].concelho}>Concelho: {obj[i].concelho}</label>
                                    <label className={"w-100 text-truncate"} title={obj[i].distrito}>Distrito: {obj[i].distrito}</label>
                                    <Row>
                                        <Col>
                                            <Button id="show-parcel-details_ApproveParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleShow(obj[i])}>Detalhes</Button>
                                        </Col>
                                        <Col>
                                            <Button id="edit-parcel_ApproveParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleEditShow(obj[i])}>Editar</Button>
                                        </Col>
                                        <Col>
                                            <Button id="confirm-parcel_ApproveParcels" onClick={() => approveParcel(obj[i])} className={"w-100 mb-2"} variant="primary" size="sm">Aprovar</Button>
                                        </Col>
                                        <Col>
                                            <Button id="reject-parcel_ApproveParcels" onClick={() => rejectParcel(obj[i])} className={"w-100 mb-2"} variant="primary" size="sm">Rejeitar</Button>
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

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/pendingbyregion");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="buttons_ApproveParcelsAdmin">
                <Row>
                    <Col>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-success" id="dropdown-distrito_ApproveParcelsAdmin">
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
                            <Dropdown.Toggle variant="outline-success" id="dropdown-concelho_ApproveParcelsAdmin">
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
                            <Dropdown.Toggle variant="outline-success" id="dropdown-freg_ApproveParcelsAdmin">
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
                        <Button id="search_ApproveParcelsAdmin" variant="success">Procurar</Button>
                    </Col>

                </Row>
            </div>

            <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <ParcelEditModal obj={obj} show={editShow} setShow={setEditShow}/>

            </LoadScript>

            <div className="approveParcelsAdminBody">
                <div className="container_ApproveParcelsAdmin">
                    {parcelList}
                </div>
            </div>
        </>
    )
}

export default ApproveParcelsAdmin