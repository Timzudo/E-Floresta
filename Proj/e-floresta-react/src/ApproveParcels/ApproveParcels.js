import "./ApproveParcels.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React, { Component }  from 'react';
import {Button, ButtonGroup, Card, Col, Container, Dropdown, Modal, Row, Spinner} from "react-bootstrap";
import {GoogleMap, LoadScript} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";


const ApproveParcels = () => {
    const [requested, setRequested] = useState(false);
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
                        arr.push(<Card className="parcel-card_ApproveParcels" style={{ width: '15rem',cursor: "pointer"}}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
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
                setRequested(false);
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/pendingbyregion");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
        setRequested(true);
    }, [])

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">

                <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>

                <ParcelEditModal obj={obj} show={editShow} setShow={setEditShow}/>

            </LoadScript>

            <div className="approveParcelsBody">
                <div className="container_ApproveParcels">
                    {requested? <Spinner id="spinner_ConfirmationPage" variant="success" animation="border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </Spinner> : parcelList}
                </div>
            </div>
        </>
    )
}

export default ApproveParcels