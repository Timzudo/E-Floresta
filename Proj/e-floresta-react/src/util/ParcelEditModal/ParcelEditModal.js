import './ParcelEditModal.css'

import {Button, ButtonGroup, Form, Modal, Spinner} from "react-bootstrap";
import {GoogleMap, Marker, Polygon} from "@react-google-maps/api";
import {useState, useRef} from "react";
import {getAreaOfPolygon, getCenterOfBounds, getDistance, getPathLength, orderByDistance} from "geolib";
import React from 'react'
import {useNavigate} from "react-router-dom";


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
    const navigate = useNavigate();

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
    const [showSelects, setShowSelects] = useState(false);

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

    const didMount = useRef(false);
    React.useEffect(() => {
        console.log("useeffect");
        if (didMount.current) setShowSelects(!showSelects);
        else didMount.current = true;
    }, [info]);

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
        }
        else {
            if(info.managerRequest !== "") {
                return(
                    <label>
                        <span><b>Gerente:</b> Pedido pendente a {info.managerRequest}</span>
                        <Button id="rmv-pending_MyParcels" className="managerButtons_ParcelEditModal" variant="outline-danger" size="sm">Anular pedido</Button>
                    </label>
                )
            }
            else {
                if(props.obj.isApproved === "APPROVED") {
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
                else {
                    return(
                        <label>
                            <b>Gerente:</b> <span className="red-text">As parcelas devem estar aprovadas para efetuar pedidos de gerenciamento.</span>
                        </label>
                    )
                }
            }
        }
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
                else if(r.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404){
                    alert("Proprietário ou parcela não existe.");
                }
                else if(r.status === 409){
                    alert("Esta parcela já possui um gerente.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            });
    }

    function deleteParcel(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/delete/" + props.obj.owner + "_" + props.obj.name, options)
            .then((r) =>{
                if(r.ok){
                    alert("Parcela removida.");
                    window.location.reload();
                }
                else if(r.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404){
                    alert("Proprietário ou parcela não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
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
                else if(r.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(xmlhttp.status === 404){
                    alert("Utilizador ou parcela não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            });


        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    setInfo(JSON.parse(xmlhttp.responseText));
                    setmanagerRequestValue(JSON.parse(xmlhttp.responseText).managerRequest);
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

    function sendManagerRequest() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    alert("Pedido enviado.")
                }
                else if(xmlhttp.status === 400) {
                    alert("Todos os campos obrigatórios devem ser preenchidos corretamente.");
                }
                else if(xmlhttp.status === 403){
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(xmlhttp.status === 404){
                    alert("Proprietário, parcela ou gerente não existe.");
                }
                else if(xmlhttp.status === 409){
                    alert("Esta parcela já possui um gerente.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
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
        let myObj = {token:localStorage.getItem('token'),
            coordinates:JSON.stringify(paths),
            area:area.toString(),
            perimeter:perimeter.toString()};
        console.log(JSON.stringify(myObj));

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
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

                <label className="labels-editParcelModal_ApproveParcels"> {hasManager()} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Distrito:</b> {props.obj.distrito} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Concelho:</b> {props.obj.concelho} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Freguesia:</b> {props.obj.freguesia} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Secção da Parcela:</b> {info.section} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Nº de Artigo da Parcela:</b> {info.article} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"><b>Área da parcela:</b> {props.obj.area}m² </label><br/>


                <label for="cobertSolo-editParcelModal_ApproveParcels"><b>Tipo de cobertura do solo:</b>
                    <input onChange={ () => (setChangedInfo(true))} id="cobertSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" defaultValue={info.cover} maxLength="64"/>
                </label>

                {showSelects?<><Form.Group className="mt-3" controlId="utilAtSolo-editParcelModal_ApproveParcels">
                        <Form.Label> <strong>Utilização atual do solo:</strong> </Form.Label>
                        <Form.Select defaultValue={info.usage} onChange={ () => (setChangedInfo(true))} className="inputs-editParcelModal">
                            <option value="Recreacional">Recreacional</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Residencial">Residencial</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Pasto">Pasto</option>
                            <option value="Floresta">Floresta</option>
                            <option value="Privado">Privado</option>
                        </Form.Select>
                    </Form.Group>


                    <Form.Group className="mt-3" controlId="utilPrevSolo-editParcelModal_ApproveParcels">
                        <Form.Label> <strong>Utilização prévia do solo:</strong> </Form.Label>
                        <Form.Select defaultValue={info.oldUsage} onChange={ () => (setChangedInfo(true))} className="inputs-editParcelModal">
                            <option value="Recreacional">Recreacional</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Residencial">Residencial</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Pasto">Pasto</option>
                            <option value="Floresta">Floresta</option>
                            <option value="Privado">Privado</option>
                        </Form.Select>
                    </Form.Group></>:<Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>}

                <p></p>
                <label htmlFor="description-editParcelModal_ApproveParcels"><b>Descrição:</b>

                    <Form.Group controlId="editParcelInput" className="inputs-editParcelModal" >
                        <Form.Control onChange={ () => (setChangedInfo(true))} required type="text"
                                      placeholder="Descrição" id="description-editParcelModal_ApproveParcels" maxLength="512"
                                      as="textarea" rows={4} defaultValue={info.description}/>
                    </Form.Group>
                </label><br/>

                <label htmlFor="file-editParcelModal_ApproveParcels"><b>Alterar Documento: </b>
                    <input id="file-editParcelModal_ApproveParcels" type="file" name="upload" accept="application/pdf" />
                </label><br/>

                <label htmlFor="photo-editParcelModal_ApproveParcels"><b>Alterar Fotografia: </b>
                    <input id="photo-editParcelModal_ApproveParcels" type="file" name="upload" accept="image/png" />
                </label><br/>

                <p></p>

                <div id="edit_modal_buttons">
                    <Button type="button" className="btn btn-success btn-sm" onClick={sendNewInfo}> Confirmar Alterações </Button>
                    <Button id="delete_parcel" onClick={() => {deleteParcel()}} className="managerButtons_ParcelEditModal" variant="danger" size="sm">Apagar parcela</Button>
                </div>


            </Modal.Body>
        </Modal>
    </>

}


export default ParcelEditModal;