import "./ApproveParcelsAdmin.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React from 'react';
import {Button, Card, Col, Dropdown, Form, Row} from "react-bootstrap";
import {LoadScript} from "@react-google-maps/api";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";


const ApproveParcelsAdmin = () => {
    const [obj, setObj] = useState({});

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);

    const objCSV = JSON.parse(localStorage.getItem('csv'));
    const distritos = Object.keys(objCSV);
    const distritoList = [];
    for(let i = 0; i<distritos.length; i++) {
        distritoList.push(<option>{distritos[i]}</option>)
    }

    const [distrito, setDistrito] = useState("");
    const [concelhoOptions, setConcelhoOptions] = useState([]);
    const [freguesiaOptions, setFreguesiaOptions] = useState([]);

    function handleSetDistrito(distrito){
        setDistrito(distrito);
        let listC = Object.keys(objCSV[distrito]);

        let list = [];
        for(let i = 0; i<listC.length; i++){
            list.push(<option>{listC[i]}</option>);
        }
        setConcelhoOptions(list);
        setFreguesiaOptions([]);
    }

    function handleSetConcelho(concelho){
        let listF = Object.keys(objCSV[distrito][concelho]);
        let list = [];
        for(let i = 0; i<listF.length; i++){
            list.push(<option>{listF[i]}</option>);
        }
        setFreguesiaOptions(list);
    }

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

    function getParcels(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        let distritoValue = document.getElementById("formDistritoAdmin").value;
        let concelhoValue = document.getElementById("formConcelhoAdmin").value;
        let freguesiaValue = document.getElementById("formFreguesiaAdmin").value;

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/pendingbyregion/"+distritoValue+"/"+concelhoValue+"/"+freguesiaValue, options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => {
                        let arr = JSON.parse(t);
                        let auxArr = [];

                        for(let i = 0; i<arr.length; i++){
                            auxArr.push(<Card className="parcel-card_ApproveParcelsAdmin" style={{ width: '15rem',cursor: "pointer"}}>
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
                        setPList(auxArr);
                    });
                }
            }).catch(console.log);
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="buttons_ApproveParcelsAdmin">
                <Row>
                    <Col>
                        <Form.Group className="mt-3" controlId="formDistritoAdmin">
                            <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                                <option disabled={true} value="-">Distrito</option>
                                {distritoList}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group className="mt-3" controlId="formConcelhoAdmin">
                            <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                                <option disabled={true} value="-">Concelho</option>
                                {concelhoOptions}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group className="mt-3" controlId="formFreguesiaAdmin">
                            <Form.Select defaultValue="-" className="map_fields">
                                <option value="-">Freguesia</option>
                                {freguesiaOptions}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Button onClick={getParcels} id="search_ApproveParcelsAdmin" variant="success">Procurar</Button>
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