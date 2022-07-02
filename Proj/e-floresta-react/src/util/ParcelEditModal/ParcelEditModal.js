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
                    <input id="cobertSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" value={info.cover} />
                </label><br/>

                <label for="utilAtSolo-editParcelModal_ApproveParcels"><b>Utilização atual do solo:</b>
                    <input id="utilAtSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" value={info.usage} />
                </label><br/>

                <label for="utilPrevSolo-editParcelModal_ApproveParcels"><b>Utilização prévia do solo:</b>
                    <input id="utilPrevSolo-editParcelModal_ApproveParcels" className="inputs-editParcelModal" type="text" value={info.oldUsage} />
                </label><br/>

                <label htmlFor="description-editParcelModal_ApproveParcels"><b>Utilização prévia do solo:</b>
                    <input id="description-editParcelModal_ApproveParcels" className="inputs-editParcelModal"
                           type="text" value={info.description}/>
                </label><br/>

                <p></p>

                <Button type="button" className="btn btn-success btn-sm"> Confirmar Alterações </Button>

            </Modal.Body>
        </Modal>
    </>

}


export default ParcelEditModal;