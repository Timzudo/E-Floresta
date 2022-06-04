import Image from './logo.png'
import './CreateAndLogin.css'
import {Link} from "react-router-dom";
import CheckIfLoggedIn from "../util/CheckIfLoggedOut";

const CreateAndLogin = () => {
  let username, password;

  const getUsername = (event)=>{
      username = event.target.value;
      console.log(username);
  }

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
    var myObj = { password: document.getElementById("session-password").value };
    var myJson = JSON.stringify(myObj);

    xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
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

          <input className="align-content" id="session-username" type="text" placeholder="Username/E-mail" onChange={getUsername}/>
          <input className="align-content" id="session-password" type="password" placeholder="Password" />

          <input className="button" type="button" value="Entrar" onClick={login}/>

        </div>

        <div className="division"> </div>

        <div className="create-account">

          <h2 className="align-content">Registe-se</h2>
          <p className="align-content">Ainda não tem conta?</p>
          <p className="align-content">Registe-se agora!</p>

          <p>Campos obrigatórios: </p>
          <input className="align-content" id="create-acc-user" type="text" placeholder="Username" />
          <input className="align-content" id="create-acc-email" type="email" placeholder="E-mail" />
          <input className="align-content" id="create-acc-name" type="text" placeholder="Nome Completo" />
          <input className="align-content" id="create-acc-pass" type="password" placeholder="Password" />
          <input className="align-content" id="create-acc-conf-pass" type="password" placeholder="Confirmar Password" />
          <select className="align-content" id="create-acc-type">
            <option value="personal">Pessoal</option>
            <option value="entity">Entidade</option>
          </select>

          <p>Campos opcionais: </p>
          <input className="align-content" id="create-acc-phone" type="text" placeholder="Telemóvel/Telefone" maxLength="9" />
          <input className="align-content" id="create-acc-nif" type="text" placeholder="NIF" maxLength="9" />

          <input className="button" type="button" value="Registar" onClick={register} />

        </div>

      </div>

    </>
  )
}

export default CreateAndLogin