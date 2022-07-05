import {Modal} from "react-bootstrap";
import React from 'react';
import {GoogleMap, LoadScript, Polygon} from "@react-google-maps/api";
import {useState} from "react";


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

const modalContainerStyle = {
    width: '100%',
    height: '45vh'
};

const ParcelDetailsModal = (props) => {

    const [obj, setObj] = useState({});
    const [centerLoc, setCenterLoc] = useState(center);
    const handleClose = () => props.setShow(false);

    let xmlhttp = new XMLHttpRequest();

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    setObj(JSON.parse(xmlhttp.responseText));
                }
            }
        }
        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo?parcelName="+props.obj.owner+"_"+props.obj.name); //TODO:alterar link
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
                center={centerLoc}
                zoom={15}
                tilt={0}
                onLoad={() => setCenterLoc(JSON.parse(props.obj.coordinates)[0])}

            >
                <Polygon
                    paths={JSON.parse(props.obj.coordinates == undefined ? "[]" : props.obj.coordinates)}
                    options={options}
                />
            </GoogleMap>

            </Modal.Body>

            <Modal.Body>
                <label><b>Proprietário:</b> {props.obj.owner} </label><br/>
                <label><b>Gerente:</b> {props.obj.manager === "" ? " - " : props.obj.manager} </label><br/>
                <label><b>Freguesia:</b> {props.obj.freguesia} </label><br/>
                <label><b>Concelho:</b> {props.obj.concelho} </label><br/>
                <label><b>Distrito:</b> {props.obj.distrito} </label><br/>
                <label><b>Área da parcela:</b> {props.obj.area}m² </label><br/>
                <label><b>Tipo de cobertura do solo:</b> {obj.cover} </label><br/>
                <label><b>Utilização atual do solo:</b> {obj.usage} </label><br/>
                <label><b>Utilização prévia do solo:</b> {obj.oldUsage} </label><br/>
                <label><b>Descrição:</b> {obj.description} </label><br/>
                <button onClick={() => (window.open(obj.documentURL), '_blank')} type="button">Ver documento</button>
            </Modal.Body>
        </Modal>
    </>
}

export default ParcelDetailsModal;