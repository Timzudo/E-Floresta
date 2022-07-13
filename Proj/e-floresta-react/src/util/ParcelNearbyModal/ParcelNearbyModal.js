import {Button, Modal, Toast} from "react-bootstrap";
import React from 'react';
import {GoogleMap, Polygon} from "@react-google-maps/api";
import {InfoWindow} from "@react-google-maps/api";
import {useState} from "react";
import {getCenterOfBounds, getDistance, orderByDistance} from "geolib";
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
const nearbyOptions = {
    fillColor: "DarkSalmon",
    fillOpacity: 0.3,
    strokeColor: "Crimson",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: true,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 0
}

const nearbyHoverOptions = {
    fillColor: "Orange",
    fillOpacity: 0.3,
    strokeColor: "Crimson",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: true,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 0
}

const modalContainerStyle = {
    width: '100%',
    height: '45vh'
};

const ParcelNearbyModal = (props) => {
    const [mapRef, setMapRef] = useState(null);
    const navigate = useNavigate();
    const [centerLoc, setCenterLoc] = useState(center);
    const [zoom, setZoom] = useState(15);
    const handleClose = () => {props.setShow(false);clearStates()}
    const [nearbyParcels, setNearbyParcels] = useState([]);
    const [infoWindow, setInfoWindow] = useState(<></>);

    function clearStates(){
        setMapRef(null);
        setCenterLoc(center);
        setZoom(15);
        setNearbyParcels([]);
        setInfoWindow(<></>);
    }

    function loadModalValues() {
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        let parcelName = props.obj.owner + "_" + props.obj.name;
        fetch("http://localhost:8080/rest/parcel/nearby?parcelName="+parcelName, options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => {
                        let obj = JSON.parse(t);
                        let arr = [];
                        for(let i = 0; i<obj.length; i++){
                            if(obj[i].parcelName !== parcelName){
                                let ref;
                                arr.push(
                                    <Polygon
                                        onLoad={(polygon) => ref = polygon}
                                        onMouseOver={(ev) => ref.setOptions(nearbyHoverOptions)}
                                        onMouseOut={(ev) => ref.setOptions(nearbyOptions)}
                                        onClick={ev => addInfoWindow(ev.latLng.lat(), ev.latLng.lng(), obj[i].parcelName)}
                                        paths={JSON.parse(obj[i].coordinates)}
                                        options={nearbyOptions}
                                    />
                                )
                            }
                        }
                        setNearbyParcels(arr);
                    })
                }
                else if(r.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404) {
                    alert("Utilizador ou parcela não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            });
    }

    function addInfoWindow(lat, lng, parcelName){
        let info =
            <InfoWindow
                position={{lat:lat, lng:lng}}
                onCloseClick={ () => setInfoWindow(<></>)}
            >
                <Button id="report-parcel_ProposedParcelsEntity" onClick={() => navigate("/make-report?id=" + parcelName)} type="submit">Reportar</Button>
            </InfoWindow>

        setInfoWindow(info);
    }

    function onLoad() {
        let centerPoint = getCenterOfBounds(JSON.parse(props.obj.coordinates));
        setCenterLoc(centerPoint);

        let arr = orderByDistance(centerPoint, JSON.parse(props.obj.coordinates));
        let mostDistant = arr[arr.length-1];
        let dist = getDistance(centerPoint, mostDistant, 1);
        setZoom(Math.round(97.1634 - (69.2069*Math.pow((dist*9), 0.0174478)))-1);
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
                    onLoad={(m) => {onLoad(props.obj.coordinates); setMapRef(m)}}
                    onCenterChanged={() => setCenterLoc(mapRef.getCenter())}
                    onClick={() => setInfoWindow(<></>)}
                >
                    <Polygon
                        paths={JSON.parse(props.obj.coordinates === undefined ? "[]" : props.obj.coordinates)}
                        options={options}
                    />
                    {nearbyParcels}
                    {infoWindow}
                </GoogleMap>
            </Modal.Body>
        </Modal>
    </>
}

export default ParcelNearbyModal;