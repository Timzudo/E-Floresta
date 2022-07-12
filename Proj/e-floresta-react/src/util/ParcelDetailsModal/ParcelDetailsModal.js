import './ParcelDetailsModal.css'
import {Button, Modal, Toast} from "react-bootstrap";
import React from 'react';
import {GoogleMap, Polygon} from "@react-google-maps/api";
import {useState} from "react";
import {getCenterOfBounds, getDistance, orderByDistance} from "geolib";
import mapCoordinates from 'geojson-apply-right-hand-rule'
import {useNavigate} from "react-router-dom";


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
    const navigate = useNavigate();

    const [obj, setObj] = useState({});
    const [centerLoc, setCenterLoc] = useState(center);
    const [zoom, setZoom] = useState(15);
    const handleClose = () => {props.setShow(false);clearStates()}

    function clearStates(){
        setObj({});
        setCenterLoc(center);
        setZoom(15);
    }

    let xmlhttp = new XMLHttpRequest();

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    setObj(JSON.parse(xmlhttp.responseText));
                }
                else if(xmlhttp.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(xmlhttp.status === 404) {
                    alert("Utilizador ou parcela não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            }
        }
        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/parcelInfo?parcelName="+props.obj.owner+"_"+props.obj.name);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    function onLoad() {
        let centerPoint = getCenterOfBounds(JSON.parse(props.obj.coordinates));
        setCenterLoc(centerPoint);

        let arr = orderByDistance(centerPoint, JSON.parse(props.obj.coordinates));
        let mostDistant = arr[arr.length-1];
        let dist = getDistance(centerPoint, mostDistant, 1);
        setZoom(Math.round(97.1634 - (69.2069*Math.pow((dist*9), 0.0174478)))-1);
    }

    function exportGeoJSON(){
        let arr = [];
        let paths = JSON.parse(props.obj.coordinates);
        for(let i = 0; i<paths.length; i++){
            let auxArr = [];
            auxArr.push(paths[i].lat);
            auxArr.push(paths[i].lng);
            arr.push(auxArr);
        }
        let auxArr = [];
        auxArr.push(paths[0].lat);
        auxArr.push(paths[0].lng);
        arr.push(auxArr);

        const geometry = mapCoordinates(arr);

        download(props.obj.name+".geojson", JSON.stringify(geometry))
    }

    function download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
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
                center={{
                    lat:centerLoc.latitude,
                    lng:centerLoc.longitude}
                }
                zoom={zoom}
                tilt={0}
                onLoad={() => onLoad(props.obj.coordinates)}

            >
                <Polygon
                    paths={JSON.parse(props.obj.coordinates === undefined ? "[]" : props.obj.coordinates)}
                    options={options}
                />
            </GoogleMap>

            </Modal.Body>

            <Modal.Body>
                <label className="field_ParcelDetailsModal" id="proprietario_ParcelDetailsModal"><b>Proprietário:</b> {props.obj.owner} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Gerente:</b> {props.obj.manager === "" ? " - " : props.obj.manager} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Freguesia:</b> {props.obj.freguesia} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Concelho:</b> {props.obj.concelho} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Distrito:</b> {props.obj.distrito} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Secção:</b> {obj.section} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Nº de Artigo:</b> {obj.article} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Área da parcela:</b> {props.obj.area}m² </label><br/>
                <label className="field_ParcelDetailsModal"><b>Tipo de cobertura do solo:</b> {obj.cover} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Utilização atual do solo:</b> {obj.usage} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Utilização prévia do solo:</b> {obj.oldUsage} </label><br/>
                <label className="field_ParcelDetailsModal"><b>Descrição:</b> {obj.description} </label><br/>
                <Button type="button" id="document_ParcelDetailsModal" variant="outline-success" size="sm" onClick={() => (window.open(obj.documentURL), '_blank')}> Ver documento </Button>
                <Button type="button" id="photo_ParcelDetailsModal" variant="outline-success" size="sm" onClick={() => (window.open(obj.photoURL), '_blank')}> Ver foto </Button><br/>
                <Button type="button" id="geojson_ParcelDetailsModal" className="btn btn-success btn-sm" onClick={exportGeoJSON}> Exportar fiheiro GeoJSON </Button>
            </Modal.Body>
        </Modal>
    </>
}

export default ParcelDetailsModal;