import "./ApproveParcels.css"

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {useEffect, useState} from 'react'
import React, { Component }  from 'react';
import {Button, ButtonGroup, Card, Dropdown, Modal} from "react-bootstrap";
import {GoogleMap, LoadScript} from "@react-google-maps/api";

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const modalContainerStyle = {
    width: '72vw',
    height: '45vh'
};

const ApproveParcels = () => {
    const [obj, setObj] = useState({});

    const [show, setShow] = useState(false);
    const [editShow, setEditShow] = useState(false);

    const handleShow = () => {
        console.log("show")
        setShow(true);
        setEditShow(false);
    }

    const handleEditShow = () => {
        console.log("showedit")
        setShow(false);
        setEditShow(true);
    }

    const handleClose = () => setShow(false);
    const handleEditClose = () => setEditShow(false);

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();
    let arr = [];

    function hasManager() {
        if(obj.manager != "") {
            return(
                <label>
                    <b>Gerente:</b> {obj.manager}
                    <Button id="rmv-manager_MyParcels" variant="danger" size="sm">Remover gerente</Button>
                </label>
            )
        } else {
            return(
                <label>
                    <b>Gerente:</b>

                    <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                            Gerentes disponíveis
                        </Dropdown.Toggle>

                        <Dropdown.Menu> //TODO:alterarDropdown
                            <Dropdown.Item value="gerente1">Gerente1</Dropdown.Item>
                            <Dropdown.Item value="gerente2">Gerente2</Dropdown.Item>
                            <Dropdown.Item value="gerente3">Gerente3</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Button id="add-manager_MyParcels" variant="success" size="sm">Adicionar gerente</Button>

                </label>
            )
        }
    }

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    setObj(obj);
                }
            }
        }
        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo"); //TODO:alterar link
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
                                    <label>Área: {obj[i].area}m²</label><br/>
                                    <label>Perímetro: {obj[i].perimeter}m</label><br/>
                                    <label>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label>Concelho: {obj[i].concelho}</label><br/>
                                    <label>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                <Button id="show-parcel-details_ApproveParcels" variant="primary" size="sm" onClick={() => handleShow()}>Ver detalhes</Button>
                                <p></p>
                                <Button id="edit-parcel_ApproveParcels" variant="primary" size="sm" onClick={() => handleEditShow()}>Editar parcela</Button>
                                <p></p>
                                <Button id="confirm-parcel_ApproveParcels" variant="primary" size="sm">Aprovar parcela</Button>
                                <p></p>
                                <Button id="reject-parcel_ApproveParcels" variant="primary" size="sm">Rejeitar parcela</Button>
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
                onShow={loadModalValues}
                show={show}
                onHide={handleClose}
                backdrop="static"
                dialogClassName="modal-xl"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title> Parcela: {obj.name} </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <LoadScript googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ">
                        <GoogleMap
                            mapContainerStyle={modalContainerStyle}
                            center={center}
                            zoom={10}
                            tilt={0}
                        >
                        </GoogleMap>
                    </LoadScript>

                </Modal.Body>

                <Modal.Body>
                    <label><b>Proprietário:</b> {obj.owner} </label><br/>
                    <label><b>Gerente:</b> {obj.manager} </label><br/>
                    <label><b>Freguesia:</b> {obj.freguesia} </label><br/>
                    <label><b>Concelho:</b> {obj.concelho} </label><br/>
                    <label><b>Distrito:</b> {obj.distrito} </label><br/>
                    <label><b>Área da parcela:</b> {obj.area}m² </label><br/>
                    <label><b>Perímetro da parcela:</b> {obj.perimeter}m </label><br/>
                    <label><b>Descrição:</b> {obj.description} </label><br/>
                    <label><b>Tipo de cobertura do solo:</b> {obj.tipoSolo} </label><br/>
                    <label><b>Utilização atual do solo:</b> {obj.soloUtil} </label><br/>
                    <label><b>Utilização prévia do solo:</b> {obj.oldSoloUtil} </label><br/>
                </Modal.Body>
            </Modal>


            <Modal
                onShow={loadModalValues}
                show={editShow}
                onHide={handleEditClose}
                backdrop="static"
                dialogClassName="modal-xl"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title> Parcela: {obj.name} </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <GoogleMap
                        mapContainerStyle={modalContainerStyle}
                        center={center}
                        zoom={10}
                        tilt={0}
                    >
                    </GoogleMap>

                    <div>

                        <ButtonGroup className="buttons-editParcelModal_ApproveParcels" size="sm">

                            <Button id="rollback-editParcelModal_ApproveParcels" variant="secondary"> Retroceder </Button>

                            <Button id="confirmNewCoord-editParcelModal_ApproveParcels" variant="success" > Confirmar novas coordenadas </Button>

                        </ButtonGroup>
                        <label id="newA-editParcelModal_ApproveParcels"> <b>Nova área:</b> </label>
                        <label id="newP-editParcelModal_ApproveParcels"> <b>Novo perímetro:</b> </label>
                    </div>
                    <p></p>

                    <label className="labels-editParcelModal_ApproveParcels"><b>Proprietário:</b> {obj.owner} </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"> {hasManager()} </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"><b>Freguesia:</b> {obj.freguesia} </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"><b>Concelho:</b> {obj.concelho} </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"><b>Distrito:</b> {obj.distrito} </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"><b>Área da parcela:</b> {obj.area}m² </label><br/>
                    <label className="labels-editParcelModal_ApproveParcels"><b>Perímetro da parcela:</b> {obj.perimeter}m </label><br/>
                    <label><b>Tipo de cobertura do solo:</b> {obj.tipoSolo}
                        <input id="cobertSolo-editParcelModal_ApproveParcels" type="text" />
                    </label><br/>
                    <label><b>Utilização atual do solo:</b> {obj.soloUtil}
                        <input id="utilAtSolo-editParcelModal_ApproveParcels" type="text" />
                    </label><br/>
                    <label><b>Utilização prévia do solo:</b> {obj.oldSoloUtil}
                        <input id="utilPrevSolo-editParcelModal_ApproveParcels" type="text" />
                    </label><br/>
                    <p></p>

                    <Button type="button" className="btn btn-success btn-sm" > Confirmar Alterações </Button>

                </Modal.Body>
            </Modal>

            <div className="approveParcelsBody">
                <div className="container_ApproveParcels">
                    {parcelList}
                </div>
            </div>
        </>
    )
}

export default ApproveParcels