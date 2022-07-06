import Image from './logo.png'
import './CreateAndLogin.css'
import {Link, useNavigate} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";
import {Button, Form, InputGroup} from "react-bootstrap";
import React, { Component }  from 'react';


const CreateAndLogin = () => {
  const navigate = useNavigate()
  let xmlhttp = new XMLHttpRequest();
  let token;
  let type = "personal";

  const submitHandler = (e) => {
    e.preventDefault();
  }


  function login() {

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          token = xmlhttp.responseText;
          let obj = JSON.parse(atob(token.split(".")[1]));
          //console.log(atob(token));
          console.log(obj);
          alert("Login efetuado com sucesso.");
          localStorage.setItem('token', token);
          localStorage.setItem('role', obj["role"]);
          navigate('/homepage');
        } else if(xmlhttp.status == 403) {
          alert("O username ou a password introduzidas estão erradas.");
        } else if(xmlhttp.status == 404) {
          alert("O username introduzido não existe.");
        } else {
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
      if(xmlhttp.readyState == 4) {
        if(xmlhttp.status == 200){
          token = xmlhttp.responseText;
          let obj = JSON.parse(atob(token.split(".")[1]));
          console.log(obj);
          alert("Registo efetuado com sucesso.");
          localStorage.setItem('token', token);
          localStorage.setItem('role', obj["role"]);
          navigate('/homepage');
        } else if(xmlhttp.status == 400) {
          alert("Todos os campos obrigatórios devem ser preenchidos.");
        } else if(xmlhttp.status == 409) {
          alert("Já existe um utilizador com o mesmo nome.");
        } else {
          alert("Não foi possível registar o utilizador.");
        }
      }
    }

    let myObj = {password:document.getElementById("create-acc-pass").value,
                  confirmation:document.getElementById("create-acc-conf-pass").value,
                  email:document.getElementById("create-acc-email").value,
                  name:document.getElementById("create-acc-name").value,
                  phone:document.getElementById("create-acc-phone").value,
                  nif:document.getElementById("create-acc-nif").value};

    let myJson = JSON.stringify(myObj);

    console.log(type);
    xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/register/"+ type + "/" + document.getElementById("create-acc-user").value, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(myJson);
  }


  return (
    <>

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
                <Form.Control type="text" placeholder="Nome de utilizador" id="session-username"/>
              </Form.Group>

              <Form.Group className="session-form" >
                <Form.Control type="password" placeholder="Palavra-Passe" id="session-password"/>
              </Form.Group>

              <Form.Group className="checkbox-container" controlId="loginShowPassCheckbox" >
                <Form.Check id="checkmark-login" type="checkbox" label="Mostrar Palavra-Passe" onClick={showPassword}/>
              </Form.Group>

              <Button id="session-button" type="submit" onClick={login}>
                Entrar
              </Button>
            </Form>

            <p></p>
            <span className="forgot-pass_Login">Esqueceu a sua palavra-passe? <a href="#">Clique aqui.</a></span>

          </div>

          <div className="division"> </div>

          <div className="create-account">

            <h2 className="align-content"><b>Registe-se</b></h2>
            <p className="align-content">Ainda não tem conta?</p>
            <p className="align-content">Registe-se agora!</p>

            <Form onSubmit={submitHandler}>
              <Form.Group className="create-form" >
                <Form.Control required type="text" placeholder="Nome de utilizador" id="create-acc-user" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="email" placeholder="E-mail" id="create-acc-email" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="text" placeholder="Nome Completo" id="create-acc-name" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="password" placeholder="Palavra-Passe" id="create-acc-pass" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control required type="password" placeholder="Confirmar Palavra-Passe" id="create-acc-conf-pass" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control placeholder="Telemóvel/Telefone" maxLength="9" id="create-acc-phone" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Control placeholder="NIF" maxLength="9" id="create-acc-nif" />
              </Form.Group>

              <Form.Group className="create-form" >
                <Form.Select required controlId="create-acc-type" onChange={(e) => {type = e.target.value}}>
                  <option value="personal">Conta Pessoal</option>
                  <option value="entity">Conta de Entidade</option>
                </Form.Select>
              </Form.Group>

              <Button id="create-acc-button" type="submit" onClick={register}>
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