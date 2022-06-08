import Image from './logo.png'
import './CreateAndLogin.css'
import {Link} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";
import {Button, Form} from "react-bootstrap";


const CreateAndLogin = () => {
  let username, password;

  let xmlhttp = new XMLHttpRequest();
  let token;

  function login() {
    /*
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          token = xmlhttp.responseText;
          alert("Login efetuado com sucesso.");
          localStorage.setItem('token', token);
          window.location.href = "/homepage";
        }
        else {
          alert("Não foi possível efetuar o login.");
        }
      }
    }
    var myObj = { password: document.getElementById("session-password").value };
    var myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(myJson);

     */
    localStorage.setItem('token', token);
    window.location.href = "/homepage";
  }

  function register() {
    xmlhttp.onreadystatechange = function() {
      if(xmlhttp.readyState == 4) {
        if(xmlhttp.status == 200){
          token = xmlhttp.responseText;
          alert("Registo efetuado com sucesso.");
          localStorage.setItem('token', token);
          window.location.href = "/homepage";
        }
        else {
          alert("Não foi possível registar o utilizador.");
        }
      }
    }
    var myObj = {username:document.getElementById("create-acc-user").value,
      password:document.getElementById("create-acc-pass").value,
      confirmation:document.getElementById("create-acc-conf-pass").value,
      email:document.getElementById("create-acc-email").value,
      name:document.getElementById("create-acc-name").value,
      phone:document.getElementById("create-acc-phone").value,
      nif:document.getElementById("create-acc-nif").value
    };
    var myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/register/"+ document.getElementById("create-acc-type").value + "/" + document.getElementById("create-acc-user").value, true);
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

      <div className="session-body">

        <div className="initiate-session">

          <h2 className="align-content">Iniciar sessão</h2>

          <Form>
            <Form.Group className="session-form" id="session-username" >
              <Form.Control type="text" placeholder="Username/E-mail" />
            </Form.Group>

            <Form.Group className="session-form" id="session-password" >
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Button id="session-button" variant="dark" type="submit" onClick={login}>
              Entrar
            </Button>
          </Form>

        </div>

        <div className="division"> </div>

        <div className="create-account">

          <h2 className="align-content">Registe-se</h2>
          <p className="align-content">Ainda não tem conta?</p>
          <p className="align-content">Registe-se agora!</p>

          <Form>
            <Form.Group className="create-form" id="create-acc-user" >
              <Form.Control required type="text" placeholder="Username" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-email" >
              <Form.Control required type="email" placeholder="E-mail" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-name" >
              <Form.Control required type="text" placeholder="Nome Completo" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-pass" >
              <Form.Control required type="password" placeholder="Password" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-conf-pass" >
              <Form.Control required type="password" placeholder="Confirmar Password" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-phone" >
              <Form.Control type="tel" pattern="[0-9]" placeholder="Telemóvel/Telefone" maxLength="9" />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-nif" >
              <Form.Control type="tel" pattern="[0-9]" placeholder="NIF" maxLength="9" />
            </Form.Group>

            <Form.Group className="create-form" controlId="create-acc-type">
              <Form.Select required>
                <option>Conta Pessoal</option>
                <option>Conta de Entidade</option>
              </Form.Select>
            </Form.Group>

            <Button id="create-acc-button" variant="dark" type="submit" onClick={register}>
              Registar
            </Button>

          </Form>

        </div>

      </div>

    </>
  )
}

export default CreateAndLogin