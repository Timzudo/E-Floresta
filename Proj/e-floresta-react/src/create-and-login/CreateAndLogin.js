import Image from './logo.png'
import './CreateAndLogin.css'

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
          sessionStorage.setItem('token', token);
          window.location.href = "logged-homepage.html";
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

  return (
    <>
      <div className="top">
        <img src={Image} alt="E-Floresta Logo" className="logo" />
      </div>

      <div class="session-body">
        <div class="initiate-session">
          <h2 class="align-content">Iniciar sessão</h2>

          <input class="align-content" id="session-username" type="text" placeholder="Username/E-mail" onChange={getUsername}/>
          <input class="align-content" id="session-password" type="password" placeholder="Password" />

          <input class="button" type="button" value="Entrar" onclick="login();" />

        </div>

        <div class="division"> </div>

        <div class="create-account">
          <h2 class="align-content">Registe-se</h2>
          <p class="align-content">Ainda não tem conta?</p>
          <p class="align-content">Registe-se agora!</p>

          <p>Campos obrigatórios: </p>
          <input class="align-content" id="create-acc-user" type="text" placeholder="Username" />
          <input class="align-content" id="create-acc-email" type="email" placeholder="E-mail" />
          <input class="align-content" id="create-acc-name" type="text" placeholder="Nome Completo" />
          <input class="align-content" id="create-acc-pass" type="password" placeholder="Password" />
          <input class="align-content" id="create-acc-conf-pass" type="password" placeholder="Confirmar Password" />
          <select class="align-content" id="create-acc-type">
            <option value="personal">Pessoal</option>
            <option value="entity">Entidade</option>
          </select>

          <p>Campos opcionais: </p>
          <input class="align-content" id="create-acc-phone" type="text" placeholder="Telemóvel/Telefone" maxlength="9" />
          <input class="align-content" id="create-acc-nif" type="text" placeholder="NIF" maxlength="9" />

          <input class="button" type="button" value="Registar" onclick="register();" />
        </div>
      </div>
    </>
  )
}

export default CreateAndLogin