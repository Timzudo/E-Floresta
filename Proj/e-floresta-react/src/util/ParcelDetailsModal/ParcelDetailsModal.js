import {Modal} from "react-bootstrap";
import {GoogleMap, LoadScript} from "@react-google-maps/api";
import React from 'react';

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const modalContainerStyle = {
    width: '100%',
    height: '45vh'
};

const ParcelDetailsModal = (props) => {

    const handleClose = () => props.setShow(false);

    let xmlhttp = new XMLHttpRequest();

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                }
            }
        }
        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo"); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return <>
        <Modal
            onShow={loadModalValues}
            show={props.show}
            onHide={handleClose}
            backdrop="static"
            dialogClassName="modal-xl"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title> Parcela: {props.obj.name} </Modal.Title>
            </Modal.Header>
            <Modal.Body>

            <GoogleMap
                mapContainerStyle={modalContainerStyle}
                center={center}
                zoom={10}
                tilt={0}
            >
            </GoogleMap>

            </Modal.Body>

            <Modal.Body>
                <label><b>Proprietário:</b> {props.obj.owner} </label><br/>
                <label><b>Gerente:</b> {props.obj.manager} </label><br/>
                <label><b>Freguesia:</b> {props.obj.freguesia} </label><br/>
                <label><b>Concelho:</b> {props.obj.concelho} </label><br/>
                <label><b>Distrito:</b> {props.obj.distrito} </label><br/>
                <label><b>Área da parcela:</b> {props.obj.area}m² </label><br/>
                <label><b>Perímetro da parcela:</b> {props.obj.perimeter}m </label><br/>
                <label><b>Descrição:</b> {props.obj.description} </label><br/>
                <label><b>Tipo de cobertura do solo:</b> {props.obj.tipoSolo} </label><br/>
                <label><b>Utilização atual do solo:</b> {props.obj.soloUtil} </label><br/>
                <label><b>Utilização prévia do solo:</b> {props.obj.oldSoloUtil} </label><br/>
            </Modal.Body>
        </Modal>
    </>
}

export default ParcelDetailsModal;