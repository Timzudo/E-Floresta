import Image from './logo.png'
import './CreateAndLogin.css'
import {Link} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";
import {Button, Form, InputGroup} from "react-bootstrap";
import React, { Component }  from 'react';


const CreateAndLogin = () => {
  let xmlhttp = new XMLHttpRequest();
  let token;

  const { language } = this.props;

  const submitHandler = (e) => {
    e.preventDefault();
  }


  function login() {

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          token = xmlhttp.responseText;
          console.log("yau")
          //console.log(atob(token));
          alert("Login efetuado com sucesso.");
          localStorage.setItem('token', token);
          window.location.href = "/homepage";
        } else if(xmlhttp.status == 403) {
          alert("O username ou a password introduzidas estão erradas.");
        } else if(xmlhttp.status == 404) {
          alert("O username introduzido não existe.");
        } else {
          alert("Não foi possível efetuar o login.");
        }
      }
    }

    var myObj = { password: document.getElementById("session-password").value };
    var myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
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
          console.log("yau")
          //console.log(atob(token));
          alert("Registo efetuado com sucesso.");
          localStorage.setItem('token', token);
          window.location.href = "/homepage";
        } else if(xmlhttp.status == 400) {
          alert("Todos os campos obrigatórios devem ser preenchidos.");
        } else if(xmlhttp.status == 409) {
          alert("Já existe um utilizador com o mesmo nome.");
        } else {
          alert("Não foi possível registar o utilizador.");
        }
      }
    }

    var myObj = {password:document.getElementById("create-acc-pass").value,
                  confirmation:document.getElementById("create-acc-conf-pass").value,
                  email:document.getElementById("create-acc-email").value,
                  name:document.getElementById("create-acc-name").value,
                  phone:document.getElementById("create-acc-phone").value,
                  nif:document.getElementById("create-acc-nif").value};

    var myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/register/"+ document.getElementById("create-acc-type").value + "/" + document.getElementById("create-acc-user").value, true);
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

            <h2 className="align-content"><b>{language == "EN" ? "Sign In": "Iniciar Sessão"}</b></h2>

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
                {language == "EN" ? "Enter": "Entrar"}
              </Button>
            </Form>

            <p></p>
            <span className="forgot-pass_Login">{language == "EN" ? "Did you forget your password?": "Esqueceu a sua palavra-passe?"} <a href="#">{language == "EN" ? "Click here.": "Clique aqui."}</a></span>

          </div>

          <div className="division"> </div>

          <div className="create-account">

            <h2 className="align-content"><b>{language == "EN" ? "Register": "Registe-se"}</b></h2>
            <p className="align-content">{language == "EN" ? "Have you not created an account yet?": "Ainda não tem conta?"}</p>
            <p className="align-content">{language == "EN" ? "Register now!": "Registe-se agora!"}</p>

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
                <Form.Select required controlId="create-acc-type" >
                  <option value="personal">{language == "EN" ? "Personal Account": "Conta Pessoal"}</option>
                  <option value="entity">{language == "EN" ? "Project Account": "Conta de Entidade"}</option>
                </Form.Select>
              </Form.Group>

              <Button id="create-acc-button" type="submit" onClick={register}>
                {language == "EN" ? "Register": "Registar"}
              </Button>

            </Form>

          </div>

        </div>

      </div>


    </>
  )
}

export default CreateAndLogin