import './ParcelEditModal.css'

import {Button, ButtonGroup, Dropdown, Modal} from "react-bootstrap";
import React from "react";
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


const ParcelEditModal = (props) => {
    const [managerValue, setmanagerValue] = useState("");
    const [changedInfo, setChangedInfo] = useState(false);
    const [obj, setObj] = useState({});
    const [info, setInfo] = useState({});

    const [managerList, setManager] = useState([]);

    const handleEditClose = () => props.setShow(false);

    let xmlhttp = new XMLHttpRequest();

    (function loadManagers() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const managersObj = JSON.parse(xmlhttp.responseText);
                    let arr = [];

                    for(let i = 0; i<managersObj.length; i++){
                        arr.push(<option value={managersObj[i]}>{managersObj[i]}</option>)
                    }
                    setmanagerValue(managersObj[0]);
                    setManager(arr);
                }
            }
        }

        let myObj = {token:localStorage.getItem('token')};
        let myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/availablemanagers/"+props.obj.owner+"_"+props.obj.name);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    })()

    function hasManager() {
        if(props.obj.manager != "") {
            return(
                <label>
                    <b>Gerente:</b> {props.obj.manager}
                    <Button id="rmv-manager_MyParcels" className="managerButtons_ParcelEditModal" variant="danger" size="sm">Remover gerente</Button>
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

    function loadModalValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    setInfo(JSON.parse(xmlhttp.responseText));
                }
            }
        }
        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/parcelInfo?parcelName="+props.obj.owner+"_"+props.obj.name);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    function sendManagerRequest() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Pedido enviado.")
                }
            }
        }
        var myObj = {token:localStorage.getItem('token'),
                        managerName:managerValue};
        console.log(myObj);
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/sendrequest/" + props.obj.owner + "_" + props.obj.name); //TODO:alterar link
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    async function sendNewInfo(){

        let any = false;
        var info = true;
        var doc = true;
        var photo = true;

        if(changedInfo){
            any = true;
            sendInfo().then(r => (info = r));
        }
        if(document.getElementById("file-editParcelModal_ApproveParcels").files[0] != undefined){
            any = true;
            sendDocument(document.getElementById("file-editParcelModal_ApproveParcels").files[0]).then(r => (doc = r));
        }
        if(document.getElementById("photo-editParcelModal_ApproveParcels").files[0] != undefined){
            any = true;
            sendPhoto(document.getElementById("photo-editParcelModal_ApproveParcels").files[0]).then(r => (photo = r));
        }

        var result = info && await doc && await photo;

        console.log("Any:" + any);
        console.log("Info:" + info);
        console.log("Doc:" + doc);
        console.log("Photo:" + photo);

        if(result && any){
            alert("Success");
        }
        else{
            alert("Error")
        }
    }

    async function sendInfo(){
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                return xmlhttp.status == 200;
            }
        }
        var myObj = {cover:document.getElementById("cobertSolo-editParcelModal_ApproveParcels").value,
                    usage:document.getElementById("utilAtSolo-editParcelModal_ApproveParcels").value,
                    oldUsage:document.getElementById("utilPrevSolo-editParcelModal_ApproveParcels").value,
                    description:document.getElementById("description-editParcelModal_ApproveParcels").value,
                    token:localStorage.getItem('token')};

        console.log(myObj);
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/info", true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    async function sendDocument(document){
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                return xmlhttp.status == 200;
            }
        }

        const formData = new FormData();
        formData.append('token', localStorage.getItem('token'));
        formData.append('document', document);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/document", true);
        xmlhttp.send(formData);
    }

    async function sendPhoto(photo){
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                return xmlhttp.status == 200;
            }
        }

        const formData = new FormData();
        formData.append('token', localStorage.getItem('token'));
        formData.append('photo', photo);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/modify/" + props.obj.owner + "_" + props.obj.name+"/photo", true);
        xmlhttp.send(formData);
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
                    center={center}
                    zoom={10}
                    tilt={0}
                >
                    <Polygon
                        paths={JSON.parse(props.obj.coordinates == undefined ? "[]" : props.obj.coordinates)}
                        options={options}
                    />
                    
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

                <label className="labels-editParcelModal_ApproveParcels"><b>Proprietário:</b> {props.obj.owner} </label><br/>

                <label className="labels-editParcelModal_ApproveParcels"> {hasManager()} </label><br/>

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