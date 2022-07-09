import TopBar from '../TopBar/TopBar.js'
import {Link, useNavigate} from "react-router-dom";
import {useRef, useState} from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React from 'react'
import {Button, Dropdown, Form, Modal} from "react-bootstrap";
import './FindUser.css'
import {getAreaOfPolygon, getCenterOfBounds, getDistance, getPathLength, orderByDistance} from "geolib";
import {GoogleMap, Polygon} from "@react-google-maps/api";
import ProfileImage from "../ChangeProfile/profile_picture.png";

const FindUser = () => {
    const [obj, setObj] = useState({});
    const [show, setShow] = useState(false);
    const didMount = useRef(false);


    function findUser(){
        let myObj = {token:localStorage.getItem('token')};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };
        console.log("yeet");
        fetch("https://moonlit-oven-349523.appspot.com/rest/info/profileinfo/"+document.getElementById("username_finduser").value, options)
            .then((r) => {
                if(r.ok){
                    r.text().then(t => setObj(JSON.parse(t)))
                }
            }).catch(r=>(console.log));
    }

    React.useEffect(() => {
        if (didMount.current) setShow(true);
        else didMount.current = true;
    }, [obj]);

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <div>
                <input id="username_finduser" type="text" placeholder="Nome do utilizador"/>
                <Button onClick={findUser} id="button_finduser" type="button" className="btn btn-success"></Button>
            </div>
            <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>
        </>

    )
}

const ParcelDetailsModal = (props) => {
    const handleClose = () => {props.setShow(false); setChangeState(false); setChangeRole(false)};
    const [changeRole, setChangeRole] = useState(false);
    const [changeState, setChangeState] = useState(false);
    let changeInfo = false;

    function sendRequest(){
        let arr = [];
        if(changeInfo){
            console.log("yau")
            arr.push(sendInfo());
        }
        if(changeState){
            arr.push(sendState());
        }
        if(changeRole){
            arr.push(sendRole());
        }

        Promise.all(arr).then((r) => {alert("Success"); handleClose(); console.log(r)}).catch(() => alert("Error"));
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
        let myObj = {token:localStorage.getItem('token'),
            newRole:document.getElementById("role_select").value};

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
                        <input onChange={() => changeInfo = true} id="change-complete-name" type="text" defaultValue={props.obj.name}/>
                    </div>
                    <div id="phone_finduser">
                        <label className="label"> Telemóvel/Telefone: </label>
                        <input onChange={() => changeInfo = true} id="change-phone" type="number" defaultValue={props.obj.phone} maxLength="9"/>
                    </div>
                    <div id="nif_finduser">
                        <label className="label" htmlFor="change-nif">NIF:</label>
                        <input onChange={() => changeInfo = true} id="change-nif" type="number" defaultValue={props.obj.nif} maxLength="9"/>
                    </div>
                    <div id="grade_finduser">
                        <p className="label"> Nível do utilizador: {props.obj.grade} </p>
                    </div>
                    <div id="type_finduser">
                        <p className="label"> Tipo de utilizador: {props.obj.type} </p>
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
                        <Form.Select id="role_select" className="map_fields" defaultValue={props.obj.role}>
                            {localStorage.getItem('role') === 'A1'?<option value="A1">A1</option>:<></>}
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </Form.Select>
                    </Form.Group>:<></>}

                    <Form.Check
                        className="position-relative mt-3"
                        type="switch"
                        id="custom-switch"
                        label="Atualizar estado do user"
                        onChange={ () => setChangeState(!changeState)}
                    />

                    {changeState?<Form.Group className="mt-3" controlId="role_dropdown_finduser">
                        <Form.Label> <strong>Estado</strong> </Form.Label>
                        <Form.Select id="state_select" className="map_fields" defaultValue={props.obj.state}>
                            <option value="ACTIVE">Ativo</option>
                            <option value="INACTIVE">Inativo</option>
                        </Form.Select>
                    </Form.Group>:<></>}

                    <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                        <div id="confirmChanges_ChangeProfile">
                            <Button onClick={sendRequest} type="button" className="btn btn-success btn-sm">Confirmar
                                Alterações</Button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </>
}

export default FindUser