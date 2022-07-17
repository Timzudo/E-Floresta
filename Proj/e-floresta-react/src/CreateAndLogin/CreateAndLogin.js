import Image from './logo.png'
import './CreateAndLogin.css'
import {Link, useNavigate} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";
import {Button, Form, InputGroup} from "react-bootstrap";
import React, {Component, useState} from 'react';
import CSVConverter from "../util/CSVConverter";


const CreateAndLogin = () => {
  const navigate = useNavigate()
  const [type, setType] = useState("personal");
  let xmlhttp = new XMLHttpRequest();
  let token;

  const obj = JSON.parse(localStorage.getItem('csv'));
  const distritos = Object.keys(obj);
  const distritoList = [];
  for(let i = 0; i<distritos.length; i++) {
    distritoList.push(<option>{distritos[i]}</option>)
  }

  const [concelhoOptions, setConcelhoOptions] = useState([]);

  function handleSetDistrito(distrito){
    let listC = Object.keys(obj[distrito]);

    let list = [];
    for(let i = 0; i<listC.length; i++){
      list.push(<option>{listC[i]}</option>);
    }
    setConcelhoOptions(list);
  }

  const submitHandler = (e) => {
    e.preventDefault();
  }


  function login() {

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          token = xmlhttp.responseText;
          let obj = JSON.parse(atob(token.split(".")[1]));
          console.log(obj);
          alert("Login efetuado com sucesso.");

          localStorage.setItem('token', token);
          localStorage.setItem('role', obj["role"]);
          localStorage.setItem('state', obj["state"]);
          navigate('/homepage');
        } else if(xmlhttp.status === 403) {
          alert("O username ou a password introduzidas estão erradas.");
        }
        else if(xmlhttp.status === 404) {
          alert("O username introduzido não existe.");
        }
        else if(xmlhttp.status === 500) {
          alert("Erro do sistema. Tente novamente mais tarde.");
        }
        else {
          alert("Não foi possível efetuar o login.");
        }
        console.log(xmlhttp.status);
      }
    }

    let myObj = { password: document.getElementById("session-password").value };
    let myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(myJson);
  }

  function showPassword() {
    var x = document.getElementById("session-password");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  function register() {
    xmlhttp.onreadystatechange = function() {
      if(xmlhttp.readyState === 4) {
        if(xmlhttp.status === 200){
          token = xmlhttp.responseText;
          let obj = JSON.parse(atob(token.split(".")[1]));
          console.log(obj);
          alert("Registo efetuado com sucesso.");
          localStorage.setItem('token', token);
          localStorage.setItem('role', obj["role"]);
          localStorage.setItem('state', 'INACTIVE');
          navigate('/homepage');
        } else if(xmlhttp.status === 400) {
          alert("Todos os campos obrigatórios devem ser preenchidos corretamente.");
        } else if(xmlhttp.status === 409) {
          alert("Utilizador ou e-mail já registado.");
        } else if(xmlhttp.status === 500) {
          alert("Erro do sistema. Tente novamente mais tarde.");
        } else {
          alert("Não foi possível registar o utilizador.");
        }
      }
    }

    let myObj;

    if(type === 'personal'){
      myObj = { password:document.getElementById("create-acc-pass").value,
                confirmation:document.getElementById("create-acc-conf-pass").value,
                email:document.getElementById("create-acc-email").value,
                name:document.getElementById("create-acc-name").value,
                phone:document.getElementById("create-acc-phone").value,
                nif:document.getElementById("create-acc-nif").value};
    }
    else{
      myObj = { password:document.getElementById("create-acc-pass").value,
        confirmation:document.getElementById("create-acc-conf-pass").value,
        email:document.getElementById("create-acc-email").value,
        name:document.getElementById("create-acc-name").value,
        phone:document.getElementById("create-acc-phone").value,
        nif:document.getElementById("create-acc-nif").value,
        distrito:document.getElementById("create_form_distrito").value,
        concelho:document.getElementById("create_form_concelho").value};
    }

    let myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/register/"+ type +"/" + document.getElementById("create-acc-user").value, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(myJson);
  }


  return (
    <>
      <CSVConverter/>
      <div className="cl_top">

        <div>
          <Link to="/"><img src={Image} alt="E-Floresta Logo" className="cl_logo" /></Link>
        </div>

      </div>

      <div className="bg-img">

        <div className="session-body">

          <div className="initiate-session">

            <h2 className="align-content"><b>Iniciar Sessão</b></h2>

            <Form onSubmit={submitHandler}>
              <Form.Group className="session-form" >
                <Form.Control type="text" placeholder="Nome de utilizador" id="session-username" maxLength="64"/>
              </Form.Group>

              <Form.Group className="session-form" >
                <Form.Control type="password" placeholder="Palavra-Passe" id="session-password" maxLength="64"/>
              </Form.Group>

              <Form.Group className="checkbox-container" controlId="loginShowPassCheckbox" >
                <Form.Check id="checkmark-login" type="checkbox" label="Mostrar Palavra-Passe" onClick={showPassword}/>
              </Form.Group>

              <Button id="session-button" variant="success" type="submit" onClick={login}>
                Entrar
              </Button>
            </Form>

            <p></p>
            <span className="forgot-pass_Login">Esqueceu a sua palavra-passe? <a  href="/recover-request">Clique aqui.</a></span>

          </div>

          <div className="division"> </div>

          <div className="create-account">

            <h2 className="align-content"><b>Registe-se</b></h2>
            <p className="align-content">Ainda não tem conta? Registe-se agora!</p>

            <Form onSubmit={submitHandler}>
              <Form.Group className="create-form" >
                <Form.Control required type="text" placeholder="Nome de utilizador" id="create-acc-user" maxLength="64"/>
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="email" placeholder="E-mail" id="create-acc-email" maxLength="64"/>
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="text" placeholder="Nome Completo" id="create-acc-name" maxLength="64"/>
              </Form.Group>

              <Form.Group className="create-form-special-outside" >
                <Form.Control className="create-form-special-inside"  required type="password" placeholder="Palavra-Passe" id="create-acc-pass" maxLength="64"/>
                <Form.Text className="text-muted">
                  Deve conter no mínimo 6 caracteres.
                </Form.Text>
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="password" placeholder="Confirmar Palavra-Passe" id="create-acc-conf-pass" maxLength="64"/>
              </Form.Group>

              <p className="green-text"><b>Campos opcionais:</b></p>

              <Form.Group className="create-form" >
                <Form.Control placeholder="Telemóvel/Telefone" maxLength="9" id="create-acc-phone" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control placeholder="NIF" maxLength="9" id="create-acc-nif" />
              </Form.Group>

              <Form.Group className="mt-2" controlId="create_form">
                <Form.Select onChange={(event) => setType(event.target.value)}  defaultValue={"personal"} className="map_fields">
                  <option value="personal">Pessoal</option>
                  <option value="entity">Entidade</option>
                </Form.Select>
              </Form.Group>

              {type === 'entity'?<><Form.Group className="mt-3" controlId="create_form_distrito">
                                  <Form.Select defaultValue='' onChange={(event) => handleSetDistrito(event.target.value)} className="map_fields">
                                    <option disabled={true} value=''>Distrito</option>
                                    {distritoList}
                                  </Form.Select>
                                </Form.Group>
                              <Form.Group className="mt-3" controlId="create_form_concelho">
                                <Form.Select className="map_fields">
                                  {concelhoOptions}
                                </Form.Select>
                              </Form.Group></>:<></>}
              <br/>
              <Button id="create-acc-button" variant="success" type="submit" onClick={register}>
                Registar
              </Button>

            </Form>

          </div>

        </div>

      </div>


    </>
  )
}

export default CreateAndLogin