import TopBar from '../TopBar/TopBar.js'
import {Link, useNavigate} from "react-router-dom";
import { useState } from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React from 'react'
import {Button, Dropdown, Form, Modal} from "react-bootstrap";
import './FindUser.css'
import {getCenterOfBounds, getDistance, orderByDistance} from "geolib";
import {GoogleMap, Polygon} from "@react-google-maps/api";
import ProfileImage from "../ChangeProfile/profile_picture.png";

const FindUser = () => {
    const [obj, setObj] = useState({});
    const [show, setShow] = useState(false);



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
                    r.text().then(t => {setObj(JSON.parse(t)); console.log(JSON.parse(t))})
                    setShow(true);
                }
            }).catch(r=>(console.log));
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <div>
                <input id="username_finduser" type="text" placeholder="username"/>
                <Button onClick={findUser} id="button_finduser" type="button" className="btn btn-success"></Button>
            </div>
            <ParcelDetailsModal obj={obj} show={show} setShow={setShow}/>
        </>

    )
}

const ParcelDetailsModal = (props) => {
    const handleClose = () => props.setShow(false);


    return <>
        <Modal
            show={props.show}
            onHide={handleClose}
            backdrop="static"
            dialogClassName="modal-xl"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title> Username: {props.obj.username} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="profileInfo_finduser">
                    <div id="email_finduser">
                        <p className="label"> E-mail: {props.obj.email} </p>
                    </div>
                    <div id="name_finduser">
                        <label className="label"> Nome Completo: </label>
                        <input id="change-complete-name" type="text" value={props.obj.name}/>
                    </div>
                    <div id="phone_finduser">
                        <label className="label"> Telemóvel/Telefone: </label>
                        <input id="change-phone" type="number" value={props.obj.phone} maxLength="9"/>
                    </div>
                    <div id="nif_finduser">
                        <label className="label" htmlFor="change-nif">NIF:</label>
                        <input id="change-nif" type="number" value={props.obj.nif} maxLength="9"/>
                    </div>
                    <div id="type_finduser">
                        <p className="label"> Tipo de utilizador: {props.obj.type} </p>
                    </div>
                    <div id="grade_finduser">
                        <p className="label"> Nível do utilizador: {props.obj.grade} </p>
                    </div>

                    <Form.Group className="mt-3" controlId="role_dropdown_finduser">
                        <Form.Label> <strong>Role</strong> </Form.Label>
                        <Form.Select className="map_fields" defaultValue={props.obj.role}>
                            {localStorage.getItem('role') === 'A1'?<option value="A1">A1</option>:<></>}
                            <option value="A2">A2</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </Form.Select>
                    </Form.Group>

                    <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                        <div id="confirmChanges_ChangeProfile">
                            <Button type="button" className="btn btn-success btn-sm">Confirmar
                                Alterações</Button>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    </>
}

export default FindUser