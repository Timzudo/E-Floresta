import "./AllParcelsAdmin.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React from 'react';
import {Button, Card, Col, Dropdown, Form, Row, Spinner} from "react-bootstrap";
import ParcelDetailsModal from "../util/ParcelDetailsModal/ParcelDetailsModal";
import ParcelEditModal from "../util/ParcelEditModal/ParcelEditModal";
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import CSVConverter from "../util/CSVConverter";
import {useNavigate} from "react-router-dom";

const containerStyle = {
    width: '75vw',
    height: '100%'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const optionsPoly = {
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

const AllParcelsAdmin = () => {
    const navigate = useNavigate();

    const [requested, setRequested] = useState(false);
    const [obj, setObj] = useState({});

    const [paths, setPaths] = useState([]);

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

    const handleClose = () => setShow(false);
    const handleEditClose = () => setEditShow(false);

    const [parcelList, setPList] = useState([]);

    function getParcels(){
        setRequested(true);
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        let distritoValue = document.getElementById("dropdown-distrito_AllParcelsAdmin").value;
        let concelhoValue = document.getElementById("dropdown-concelho_AllParcelsAdmin").value;
        let freguesiaValue = document.getElementById("dropdown-freg_AllParcelsAdmin").value;

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/approvedbyregion/"+distritoValue+"/"+concelhoValue+"/"+freguesiaValue, options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => {
                        let arr = JSON.parse(t);
                        let auxArr = [];
                        let pathsArr = [];
                        for(let i = 0; i<arr.length; i++){
                            auxArr.push(<Card className="parcel-card_AllParcelsAdmin" style={{ width: '15rem',cursor: "pointer"}}>
                                <Card.Img className="parcel_picture_AllParcelsAdmin" variant="top" src={arr[i].photoURL} />
                                <Card.Body>
                                    <Card.Title>{arr[i].name} </Card.Title>
                                    <Card.Text>
                                        <label className={"w-100 text-truncate"}>Área: {arr[i].area}m²</label>
                                        <label className={"w-100 text-truncate"} title={arr[i].freguesia}>Freguesia: {arr[i].freguesia}</label>
                                        <label className={"w-100 text-truncate"} title={arr[i].concelho}>Concelho: {arr[i].concelho}</label>
                                        <label className={"w-100 text-truncate"} title={arr[i].distrito}>Distrito: {arr[i].distrito}</label>
                                        <Row>
                                            <Col>
                                                <Button id="show-parcel-details_AllParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleShow(arr[i])}>Detalhes</Button>
                                            </Col>
                                            <Col>
                                                <Button id="edit-parcel_AllParcels" className={"w-100 mb-2"} variant="primary" size="sm" onClick={() => handleEditShow(arr[i])}>Editar</Button>
                                            </Col>
                                        </Row>
                                    </Card.Text>

                                </Card.Body>
                            </Card>);
                            pathsArr.push(
                                <Polygon
                                    paths={JSON.parse(arr[i].coordinates)}
                                    options={optionsPoly}
                                />
                            );
                        }
                        setPaths(pathsArr);
                        setPList(auxArr);
                        setRequested(false);
                    });
                }
                else if(r.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404){
                    alert("Utilizador não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            }).catch(() => setRequested(false));

    }

    return(<>
            <CSVConverter/>
        <CheckIfLoggedOut />
        <TopBar />

            <div className="buttons_AllParcelsAdmin">
                <Row>
                    <Col>
                        <Form.Group className="mt-3" controlId="dropdown-distrito_AllParcelsAdmin">
                            <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                                <option disabled={true} value="-">Distrito</option>
                                {distritoList}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group className="mt-3" controlId="dropdown-concelho_AllParcelsAdmin">
                            <Form.Select defaultValue="-" className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                                <option disabled={true} value="-">Concelho</option>
                                {concelhoOptions}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Form.Group className="mt-3" controlId="dropdown-freg_AllParcelsAdmin">
                            <Form.Select defaultValue="-" className="map_fields">
                                <option value="-">Freguesia</option>
                                {freguesiaOptions}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col>
                        <Button onClick={getParcels} id="search_AllParcelsAdmin" variant="success">Procurar</Button>
                    </Col>

                </Row>
            </div>


            <LoadScript googleMapsApiKey="AIzaSyC3yXGtu-O5HD8LhlQ18w68dby2HQ2X3O4">

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

export default AllParcelsAdmin