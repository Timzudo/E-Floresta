import  './ChangeProfile.css'
import TopBar from '../TopBar/TopBar.js'
import ProfileImage from "./profile_picture.png";
import {Link} from "react-router-dom";
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import {Button} from "react-bootstrap";

const ChangeProfile = () => {

    let username, email, name, phone, nif, type

    let xmlhttp = new XMLHttpRequest();

    function changeProfile() {

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Informação alterada com sucesso.");
                    window.location.href = "/profile";
                } else if(xmlhttp.status == 403 ||xmlhttp.status == 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    window.location.href = "/";
                }
                else {
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {name:document.getElementById("change-complete-name").value,
            phone:document.getElementById("change-phone").value,
            nif:document.getElementById("change-nif").value,
            token:localStorage.getItem('token')
        };

        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/modify/info");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="profileInfo_ChangeProfile">
                <img src={ProfileImage} alt="Profile picture" className="profile_pic"/>
                <p></p>
                <div id="username_ChangeProfile">
                    Username: {username} <p className="label" />
                </div>
                <div id="email_ChangeProfile">
                    E-mail: {email} <p className="label" />
                </div>
                <div id="name_ChangeProfile">
                    Nome Completo: {name} <input className="label" id="change-complete-name" type="text" />
                </div>
                <div id="phone_ChangeProfile">
                    Telemóvel/Telefone: {phone} <input className="label" id="change-phone" type="number" maxLength="9"/>
                </div>
                <div id="nif_ChangeProfile">
                    NIF: {nif} <input className="label" id="change-nif" type="number" maxLength="9"/>
                </div>
                <div id="type_ChangeProfile">
                    <p className="label"></p> Tipo de utilizador: {type}
                </div>

                <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                    <div id="confirmChanges_ChangeProfile">
                        <Button type="button" className="btn btn-success btn-sm" onClick={changeProfile} >Confirmar Alterações</Button>
                    </div>

                    <div id="cancelChanges_ChangeProfile">
                        <Link to="/profile">
                            <Button type="button" className="btn btn-secondary btn-sm">Cancelar Alterações </Button>
                        </Link>

                    </div>
                </div>

            </div>

        </>

    )
}

export default ChangeProfile