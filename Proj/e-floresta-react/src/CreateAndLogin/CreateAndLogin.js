import Image from './logo.png'
import './CreateAndLogin.css'
import {Link} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";
import {Button, Form} from "react-bootstrap";


const CreateAndLogin = () => {
  let username, password, confirmation ,email ,name ,phone, nif, type;

  let xmlhttp = new XMLHttpRequest();
  let token;


  function login() {


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

    let myObj = { password: document.getElementById("session-password").value };
    let myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(myJson);
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

    var myObj = {password:password,
                  confirmation:confirmation,
                  email:email,
                  name:name,
                  phone:phone,
                  nif:nif};

    var myJson = JSON.stringify(myObj);
    console.log(type);

    xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/register/"+ type + "/" + username, true);
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
              <Form.Control type="text" placeholder="Username" onChange={e => username = e.target.value}/>
            </Form.Group>

            <Form.Group className="session-form" id="session-password" >
              <Form.Control type="password" placeholder="Password" onChange={e => password = e.target.value}/>
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
              <Form.Control required type="text" placeholder="Username" onChange={e => username = e.target.value} />
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-email" >
              <Form.Control required type="email" placeholder="E-mail" onChange={e => email = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-name" >
              <Form.Control required type="text" placeholder="Nome Completo" onChange={e => name = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-pass" >
              <Form.Control required type="password" placeholder="Password" onChange={e => password = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-conf-pass" >
              <Form.Control required type="password" placeholder="Confirmar Password" onChange={e => confirmation = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-phone" >
              <Form.Control type="tel" pattern="[0-9]" placeholder="Telemóvel/Telefone" maxLength="9" onChange={e => phone = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" id="create-acc-nif" >
              <Form.Control type="tel" pattern="[0-9]" placeholder="NIF" maxLength="9" onChange={e => nif = e.target.value}/>
            </Form.Group>

            <Form.Group className="create-form" controlId="create-acc-type">
              <Form.Select required onChange={e => type = e.target.value}>
                <option value="personal">Conta Pessoal</option>
                <option value="entity">Conta de Entidade</option>
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