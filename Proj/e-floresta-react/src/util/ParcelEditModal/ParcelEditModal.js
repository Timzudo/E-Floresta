import './ParcelEditModal.css'

import {Button, ButtonGroup, Modal} from "react-bootstrap";
import {GoogleMap, Marker, Polygon} from "@react-google-maps/api";
import {useState} from "react";
import {getAreaOfPolygon, getCenterOfBounds, getDistance, getPathLength, orderByDistance} from "geolib";
import React from 'react'


const center = {
    lat: 38.660677,
    lng: -9.205971
};

const options = {
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
const optionsSecondary = {
    fillColor: "DarkCyan",
    fillOpacity: 0.4,
    strokeColor: "Aqua",
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


const ParcelEditModal = (props) => {
    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);
    const [zoom, setZoom] = useState(15);

    const [managerValue, setmanagerValue] = useState("");
    const [managerRequestValue, setmanagerRequestValue] = useState("");
    const [changedInfo, setChangedInfo] = useState(false);
    const [centerLoc, setCenterLoc] = useState(center);
    const [info, setInfo] = useState({});

    const [managerList, setManager] = useState([]);

    const handleEditClose = () => {closeModal();clearStates()}

    function clearStates(){
        setMarker([]);
        setPaths([]);
        setArea(0);
        setPerimeter(0);
        setZoom(0);
        setmanagerValue("");
        setmanagerRequestValue("");
        setChangedInfo(false);
        setCenterLoc(center);
        setInfo({});
        setManager([]);
    }

    function closeModal(){
        props.setShow(false);
    }

    let xmlhttp = new XMLHttpRequest();


    function onLoad() {
        let centerPoint = getCenterOfBounds(JSON.parse(props.obj.coordinates));
        setCenterLoc({
            lat: centerPoint.latitude,
            lng: centerPoint.longitude
        });

        let arr = orderByDistance(centerPoint, JSON.parse(props.obj.coordinates));
        let mostDistant = arr[arr.length-1];
        let dist = getDistance(centerPoint, mostDistant, 1);
        setZoom(Math.round(97.1634 - (69.2069*Math.pow((dist*9), 0.0174478)))-1);
    }

    function addMarker(lat, lng) {
        const google = window.google;

        setMarker(markerList.concat(<Marker key={markerList.length} id={markerList.length}
                                            position={{
                                                lat: lat,
                                                lng: lng
                                            }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                fillColor: "Aqua",
                                                fillOpacity: 1.0,
                                                strokeWeight: 0,
                                                scale: 5
                                            }}/>))

        setPaths(paths.concat({
            lat: lat,
            lng: lng
        }));
    }

    function rollback() {
        setMarker(markerList.filter((element, index) => index < markerList.length - 1));
        setPaths(paths.filter((element, index) => index < paths.length - 1));
    }

    React.useEffect(() => {
        setPerimeter(getPathLength(paths) + (paths.length>1 ? getDistance(paths[paths.length-1], paths[0]) : 0));
        setArea(Math.round(getAreaOfPolygon(paths)));
    }, [paths]);

    function hasManager() {
        if(props.obj.manager !== "") {
            return(
                <label>
                    <b>Gerente:</b> {props.obj.manager}
                    <Button onClick={() => removeManager()} id="rmv-manager_MyParcels" className="managerButtons_ParcelEditModal" variant="danger" size="sm">Remover gerente</Button>
                </label>
            )
        } else {
            return(
                <label>
                    <b>Gerente:</b>

                    <select id="dropdown-basic" className="managerButtons_ParcelEditModal" onChange={(e) => {setmanagerValue(e.target.value)}/*(e) => {managerValue = e}*/}>
                        {managerList}
                    </select>

                    <Button onClick={() => {sendManagerRequest()}} id="add-manager_MyParcels" className="managerButtons_ParcelEditModal" variant="success" size="sm">Adicionar gerente</Button>

                </label>
            )
        }
    }

    function managerRequest(){

        return(<label>
            <b>Pedido enviado:</b> {managerRequestValue}
            <Button onClick={() => {removeRequest()}} id="rmv-manager_MyParcels" className="managerButtons_ParcelEditModal" variant="danger" size="sm">Cancelar pedido</Button>
        </label>)
    }

    function removeManager(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/removemanager/" + props.obj.owner + "_" + props.obj.name, options)
            .then((r) =>{
                if(r.ok){
                    alert("Gerente removido.");
                    window.location.reload();
                }
            });
    }

    function removeRequest(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/rejectrequest/" + props.obj.owner + "_" + props.obj.name, options)
            .then((r) =>{
                if(r.ok){
                    alert("Pedido removido.");
                    window.location.reload();
                }
            });
    }

    function loadModalValues() {
        let myObjManager = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObjManager),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/availablemanagers/"+props.obj.owner+"_"+props.obj.name, options)
            .then((r) => {
                if(r.ok){
                    r.text().then((text) => {
                        const managersObj = JSON.parse(text);
                        let arr = [];

                        for(let i = 0; i<managersObj.length; i++){
                            arr.push(<option value={managersObj[i]}>{managersObj[i]}</option>)
                        }
                        setmanagerValue(managersObj[0]);
                        setManager(arr);
                    })
                }
            });


        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    setInfo(JSON.parse(xmlhttp.responseText));
                    setmanagerRequestValue(JSON.parse(xmlhttp.responseText).managerRequest);
                }
            }
        }
        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/parcelInfo?parcelName="+props.obj.owner+"_"+props.obj.name);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    function sendManagerRequest() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    alert("Pedido enviado.")
                }
            }
        }
        var myObj = {token:localStorage.getItem('token'),
                        managerName:managerValue};
        console.log(myObj);
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/sendrequest/" + props.obj.owner + "_" + props.obj.name); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    async function sendNewInfo(){
        let arr = [];

        if(changedInfo){
            arr.push(sendInfo());
            console.log("yau");
        }
        if(document.getElementById("file-editParcelModal_ApproveParcels").files[0] !== undefined){
            arr.push(sendDocument(document.getElementById("file-editParcelModal_ApproveParcels").files[0]));
        }
        if(document.getElementById("photo-editParcelModal_ApproveParcels").files[0] !== undefined){
            arr.push(sendPhoto(document.getElementById("photo-editParcelModal_ApproveParcels").files[0]));
        }
        if(paths.length > 2){
            arr.push(sendCoordinates(paths));
            console.log("send");
        }

        Promise.all(arr).then(() => {alert("Success"); window.location.reload()}).catch(() => alert("Error"));
    }

    async function sendInfo(){
        let myObj = {cover:document.getElementById("cobertSolo-editParcelModal_ApproveParcels").value,
            usage:document.getElementById("utilAtSolo-editParcelModal_ApproveParcels").value,
            oldUsage:document.getElementById("utilPrevSolo-editParcelModal_ApproveParcels").value,
            description:document.getElementById("description-editParcelModal_ApproveParcels").value,
            token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/info", options);
    }

    async function sendDocument(document){
        let formData = new FormData();
        formData.append('token', localStorage.getItem('token'));
        formData.append('document', document);

        const options = {
            method: 'POST',
            body: formData,
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/document", options);
    }

    async function sendPhoto(photo){
        let formData = new FormData();
        formData.append('token', localStorage.getItem('token'));
        formData.append('photo', photo);

        const options = {
            method: 'POST',
            body: formData,
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/photo", options);
    }

    async function sendCoordinates(paths){
        let formData = new FormData();
        formData.append('token', localStorage.getItem('token'));
        formData.append('coordinates', JSON.stringify(paths));
        formData.append('area', area.toString());
        formData.append('perimeter', perimeter.toString());

        const options = {
            method: 'POST',
            body: formData,
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/coordinates", options);
    }


    return <>
        <Modal
            onShow={loadModalValues}
            show={props.show}
            onHide={handleEditClose}
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

                    zoom={zoom}
                    tilt={0}
                    onLoad={() => onLoad(paths)}
                    onClick={ev => {
                        addMarker(ev.latLng.lat(), ev.latLng.lng())
                    }}
                >
                    <Polygon
                        paths={JSON.parse(props.obj.coordinates === undefined ? "[]" : props.obj.coordinates)}
                        options={options}
                    />
                    <Polygon
                        paths={paths}
                        options={optionsSecondary}
                    />
                    {markerList}
                    
                </GoogleMap>

                <div>

                    <ButtonGroup className="buttons-editParcelModal_ApproveParcels" size="sm">

                        <Button id="rollback-editParcelModal_ApproveParcels" variant="secondary" className={paths.length > 0 ? "btn btn-success" : "btn btn-secondary"} onClick={rollback}> Retroceder </Button>

                    </ButtonGroup>
                    <label id="newA-editParcelModal_ApproveParcels"> <b>Nova área:{area}</b> </label>
                    <label id="newP-editParcelModal_ApproveParcels"> <b>Novo perímetro:{perimeter}</b> </label>
                </div>
                <p></p>

                <label className="labels-editParcelModal_ApproveParcels"><b>Proprietário:</b> {props.obj.owner} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"> {managerRequestValue===""?hasManager():managerRequest()} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Freguesia:</b> {props.obj.freguesia} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Concelho:</b> {props.obj.concelho} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Distrito:</b> {props.obj.distrito} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Área da parcela:</b> {props.obj.area}m² </label><br/>


                <label for="cobertSolo-editParcelModal_ApproveParcels"><b>Tipo de cobertura do solo:</b>
                    <input onChange={ () => (setChangedInfo(true))} id="cobertSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" defaultValue={info.cover} />
                </label><br/>

                <label for="utilAtSolo-editParcelModal_ApproveParcels"><b>Utilização atual do solo:</b>
                    <input onChange={ () => (setChangedInfo(true))} id="utilAtSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" defaultValue={info.usage} />
                </label><br/>

                <label for="utilPrevSolo-editParcelModal_ApproveParcels"><b>Utilização prévia do solo:</b>
                    <input onChange={ () => (setChangedInfo(true))} id="utilPrevSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" defaultValue={info.oldUsage} />
                </label><br/>

                <label htmlFor="description-editParcelModal_ApproveParcels"><b>Descrição:</b>
                    <input onChange={ () => (setChangedInfo(true))} id="description-editParcelModal_ApproveParcels" className="inputs-editParcelModal"
                           type="text" defaultValue={info.description}/>
                </label><br/>

                <label htmlFor="file-editParcelModal_ApproveParcels"><b>Alterar Documento: </b>
                    <input id="file-editParcelModal_ApproveParcels" type="file" name="upload" accept="application/pdf" />
                </label><br/>

                <label htmlFor="photo-editParcelModal_ApproveParcels"><b>Alterar Fotografia: </b>
                    <input id="photo-editParcelModal_ApproveParcels" type="file" name="upload" accept="image/png" />
                </label><br/>

                <p></p>

                <Button type="button" className="btn btn-success btn-sm" onClick={sendNewInfo}> Confirmar Alterações </Button>

            </Modal.Body>
        </Modal>
    </>

}


export default ParcelEditModal;