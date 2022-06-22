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

    const [obj, setObj] = useState({});

    const handleEditClose = () => props.setShow(false);

    let xmlhttp = new XMLHttpRequest();

    function hasManager() {
        if(props.obj.manager != "") {
            return(
                <label>
                    <b>Gerente:</b> {props.obj.manager}
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
                    setObj(JSON.parse(xmlhttp.responseText));
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
                <label className="labels-editParcelModal_ApproveParcels"><b>Perímetro da parcela:</b> {props.obj.perimeter}m </label><br/>
                <label><b>Tipo de cobertura do solo:</b> {props.obj.tipoSolo}
                    <input id="cobertSolo-editParcelModal_ApproveParcels" type="text" />
                </label><br/>
                <label><b>Utilização atual do solo:</b> {props.obj.soloUtil}
                    <input id="utilAtSolo-editParcelModal_ApproveParcels" type="text" />
                </label><br/>
                <label><b>Utilização prévia do solo:</b> {props.obj.oldSoloUtil}
                    <input id="utilPrevSolo-editParcelModal_ApproveParcels" type="text" />
                </label><br/>
                <p></p>

                <Button type="button" className="btn btn-success btn-sm" > Confirmar Alterações </Button>

            </Modal.Body>
        </Modal>
    </>

}


export default ParcelEditModal;