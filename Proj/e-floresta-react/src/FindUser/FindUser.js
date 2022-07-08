import TopBar from '../TopBar/TopBar.js'
import {useNavigate} from "react-router-dom";
import { useState } from 'react'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React from 'react'
import {Button} from "react-bootstrap";
import './FindUser.css'

const FindUser = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState("");



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
                    r.text().then(t => {setResult(JSON.parse(t))})
                    console.log("yau");
                }
            }).catch(r=>(console.log));
    }
    /*let xmlhttp = new XMLHttpRequest();

    //Permite correr a funcao quando a pagina e carregada
    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    setUsername(obj.username);
                    setEmail(obj.email)
                    setName(obj.name);
                    setPhone(obj.phone);
                    setNif(obj.nif);
                    setType(obj.type);
                    setState(obj.state);
                } else if(xmlhttp.status == 403 ||xmlhttp.status == 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                }
                else {
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/info/profileinfo");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }, [])*/

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />
            <div>
                <input id="username_finduser" type="text" placeholder="username"/>
                <Button onClick={findUser} id="button_finduser" type="button" className="btn btn-success"></Button>
            </div>


        </>

    )
}

export default FindUser