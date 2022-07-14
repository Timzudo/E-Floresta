import './FindUser.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Link, useNavigate} from "react-router-dom";
import {useRef, useState} from 'react'
import React from 'react'
import {Button, Dropdown, Form, Modal} from "react-bootstrap";
import {getAreaOfPolygon, getCenterOfBounds, getDistance, getPathLength, orderByDistance} from "geolib";
import {GoogleMap, Polygon} from "@react-google-maps/api";
import ProfileImage from "../ChangeProfile/profile_picture.png";
import CSVConverter from "../util/CSVConverter";
import CheckIfActive from "../util/CheckIfActive";


const FindUser = () => {
    const navigate = useNavigate();

    const [obj, setObj] = useState({});
    const [show, setShow] = useState(false);
    const didMount = useRef(false);
    const csvObj = JSON.parse(localStorage.getItem('csv'));


    function findUser(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };
        fetch("https://moonlit-oven-349523.appspot.com/rest/info/profileinfo/"+document.getElementById("username_finduser").value, options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => setObj(JSON.parse(t)))
                }
                else if(r.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/');
                }
                else if(r.status === 404) {
                    alert("O utilizador não existe.");
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
            }).catch(r=>(console.log));
    }

    React.useEffect(() => {
        if (didMount.current) setShow(true);
        else didMount.current = true;
    }, [obj]);

    return(
        <>
            <CSVConverter/>
            <CheckIfLoggedOut />
            <CheckIfActive />
            <TopBar />

            <div className="bg-img_FindUser">
                <div className="body_FindUser">
                    <br/>
                    <h2 className="title_FindUser"><b>Encontre um utilizador</b></h2>
                    <p className="description_FindUser">Verifique ou altere a informação de um utilizador</p>
                    <input id="username_finduser" type="text" placeholder="Username do utilizador" maxLength="64"/>
                    <Button onClick={findUser} id="button_FindUser" type="button" className="btn btn-success">Procurar</Button>
                </div>
                <FindUserModal obj={obj} show={show} setShow={setShow} csvObj={csvObj}/>
            </div>

        </>

    )
}

const FindUserModal = (props) => {
    const handleClose = () => {props.setShow(false);clearStates()};
    const [changeRole, setChangeRole] = useState(false);
    const [changeState, setChangeState] = useState(false);
    let changeInfo = false;
    const [newRole, setNewRole] = useState("");

    const [distritoOptions, setDistritoOptions] = useState([]);
    const [concelhoOptions, setConcelhoOptions] = useState([]);
    const [freguesiaOptions, setFreguesiaOptions] = useState([]);
    const [distritoValue, setDistritoValue] = useState("");
    const [concelhoValue, setConcelhoValue] = useState("");
    const [freguesiaValue, setFreguesiaValue] = useState("");




    function handleShow(){
        const distritoList = [];
        const distritos = Object.keys(props.csvObj);
        for(let i = 0; i<distritos.length; i++) {
            distritoList.push(<option>{distritos[i]}</option>)
        }
        setDistritoOptions(distritoList);
        setNewRole(props.obj.role);
    }

    function clearStates(){
        setChangeState(false);
        setChangeRole(false);
        changeInfo = false;
        setNewRole(props.obj.role);
        setDistritoOptions([]);
        setConcelhoOptions([]);
        setFreguesiaOptions([]);
    }

    function handleSetDistrito(distrito){
        setDistritoValue(distrito);
        let listC = Object.keys(props.csvObj[distrito]);

        let list = [];
        for(let i = 0; i<listC.length; i++){
            list.push(<option>{listC[i]}</option>);
        }
        setConcelhoOptions(list);
        setFreguesiaOptions([]);
    }

    function handleSetConcelho(concelho){
        setConcelhoValue(concelho);
        let listF = Object.keys(props.csvObj[distritoValue][concelho]);

        let list = [];
        for(let i = 0; i<listF.length; i++){
            list.push(<option>{listF[i]}</option>);
        }
        setFreguesiaOptions(list);
    }

    function sendRequest(){
        let arr = [];
        if(changeInfo){
            arr.push(sendInfo());
        }
        if(changeState){
            arr.push(sendState());
        }
        if(changeRole){
            arr.push(sendRole());
        }

        Promise.all(arr).then((r) => {alert("Success"); handleClose(); console.log(r)}).catch((reason) => console.log(reason));
    }

    async function sendInfo(){
        let myObj = {name:document.getElementById("change-complete-name").value,
                        phone:document.getElementById("change-phone").value,
                        nif:document.getElementById("change-nif").value,
                        token:localStorage.getItem('token')};

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/modify/info/" + props.obj.username, options);
    }

    async function sendState(){
        let myObj = {token:localStorage.getItem('token'),
            newState:document.getElementById("state_select").value};

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/modify/state/" + props.obj.username, options);
    }

    async function sendRole(){
        console.log(concelhoValue);
        let myObj = {token:localStorage.getItem('token'),
            newRole:document.getElementById("role_select").value,
            distrito:distritoValue,
            concelho:concelhoValue,
            freguesia:freguesiaValue};

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        return fetch("https://moonlit-oven-349523.appspot.com/rest/modify/role/" + props.obj.username, options);
    }


    return <>
        <Modal
            show={props.show}
            onHide={handleClose}
            backdrop="static"
            dialogClassName="modal-xl"
            keyboard={false}
            onShow={handleShow}
        >
            <Modal.Header closeButton>
                <Modal.Title> {props.obj.username} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="profileInfo_finduser">
                    <div id="email_finduser">
                        <p className="label"> E-mail: {props.obj.email} </p>
                    </div>
                    <div id="name_finduser">
                        <label className="label"> Nome Completo: </label>
                        <input onChange={() => changeInfo = true} className="input-modal_FindUser" id="change-complete-name" type="text" defaultValue={props.obj.name}/>
                    </div>
                    <div id="phone_finduser">
                        <label className="label"> Telemóvel/Telefone: </label>
                        <input onChange={() => changeInfo = true} className="input-modal_FindUser" id="change-phone" type="number" defaultValue={props.obj.phone} maxLength="9"/>
                    </div>
                    <div id="nif_finduser">
                        <label className="label" htmlFor="change-nif">NIF:</label>
                        <input onChange={() => changeInfo = true}className="input-modal_FindUser" id="change-nif" type="number" defaultValue={props.obj.nif} maxLength="9"/>
                    </div>
                    <div id="grade_finduser">
                        <p className="label"> Nível do utilizador: {props.obj.grade} </p>
                    </div>
                    <div id="type_finduser">
                        <p className="label"> Tipo de utilizador: {props.obj.type} </p>
                    </div>
                    <div id="state_finduser">
                        <p className="label"> Estado do utilizador: {props.obj.state} </p>
                    </div>
                    <div id="distrito_finduser">
                        <p className="label"> Distrito: {props.obj.distrito} </p>
                    </div>
                    <div id="concelho_finduser">
                        <p className="label">Concelho: {props.obj.concelho} </p>
                    </div>
                    <div id="freguesia_finduser">
                        <p className="label"> Freguesia: {props.obj.freguesia} </p>
                    </div>
                    <Form.Check
                        className="position-relative mt-3"
                        type="switch"
                        id="custom-switch"
                        label="Atualizar role do user"
                        onChange={ () => setChangeRole(!changeRole)}
                    />

                    {changeRole?<Form.Group className="mt-3" controlId="role_dropdown_finduser">
                        <Form.Label> <strong>Role</strong> </Form.Label>
                        <Form.Select onChange={(ce) => setNewRole(ce.target.value)} id="role_select" className="map_fields" defaultValue={props.obj.role}>
                            {localStorage.getItem('role') === 'A1'?<option value="A1">Administrador de Sistema</option>:<></>}
                            <option value="A2">Moderador</option>
                            <option value="B1">Técnico Camara Municipal</option>
                            <option value="B2">Técnico Junta de Freguesia</option>
                            <option value="C">Entidade</option>
                            <option value="D">Utilizador</option>
                        </Form.Select>
                    </Form.Group>:<></>}


                    {((String(newRole).includes("B") || newRole === "C") && changeRole)?<>
                        <Form.Group className="mt-3" controlId="distrito_dropdown_finduser">
                            <Form.Label> <strong>Distrito</strong> </Form.Label>
                            <Form.Select onChange={(e) => handleSetDistrito(e.target.value)} id="role_select" className="map_fields" defaultValue="">
                                <option disabled={true} value="">-</option>
                                {distritoOptions}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mt-3" controlId="concelho_dropdown_finduser">
                            <Form.Label> <strong>Concelho</strong> </Form.Label>
                            <Form.Select onChange={(e) => handleSetConcelho(e.target.value)} id="role_select" className="map_fields" defaultValue="">
                                <option disabled={true} value="">-</option>
                                {concelhoOptions}
                            </Form.Select>
                        </Form.Group>
                    </>:<></>}

                    {(newRole === "B2") && changeRole?<>
                        <Form.Group className="mt-3" controlId="freguesia_dropdown_finduser">
                            <Form.Label> <strong>Freguesia</strong> </Form.Label>
                            <Form.Select onChange={(e) =>setFreguesiaValue(e.target.value)} id="role_select" className="map_fields" defaultValue="">
                                <option disabled={true} value="">-</option>
                                {freguesiaOptions}
                            </Form.Select>
                        </Form.Group>
                    </>:<></>}

                    <Form.Check
                        className="position-relative mt-3"
                        type="switch"
                        id="custom-switch"
                        label="Atualizar estado do user"
                        onChange={ () => setChangeState(!changeState)}
                    />

                    {changeState?<Form.Group className="mt-3" controlId="state_dropdown_finduser">
                        <Form.Label> <strong>Estado</strong> </Form.Label>
                        <Form.Select id="state_select" className="map_fields" defaultValue={props.obj.state}>
                            <option value="ACTIVE">Ativo</option>
                            <option value="INACTIVE">Inativo</option>
                        </Form.Select>
                    </Form.Group>:<></>}

                    <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                        <div id="confirmChanges_ChangeProfile">
                            <Button onClick={sendRequest} className="confirm-modal_FindUser" type="button" variant="success" size="sm">
                                Confirmar Alterações
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </>
}

export default FindUser