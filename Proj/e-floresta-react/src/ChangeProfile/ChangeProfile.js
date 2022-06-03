import  './ChangeProfile.css'
import TopBar from '../TopBar/TopBar.js'
import ProfileImage from "./profile_picture.png";
import {Link} from "react-router-dom";
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";

const ChangeProfile = () => {

    let username, email, name, phone, nif, type

    let xmlhttp = new XMLHttpRequest();

    function getValues() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    username = obj.username;
                    email = obj.email;
                    name = obj.name;
                    phone = obj.phone;
                    nif = obj.nif;
                    type = obj.type;
                } else {
                    alert("Não foi possível obter informação.");
                }
            }
        }

        var myObj = {tokenId:sessionStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/info/profileinfo");
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
                    <p className="label">Username: {username}</p>
                </div>
                <div id="email_ChangeProfile">
                    E-mail: {email} <input className="label" id="change-email" type="text" />
                </div>
                <div id="name_ChangeProfile">
                    Nome Completo: {name} <input className="label" id="change-name" type="text" />
                </div>
                <div id="phone_ChangeProfile">
                    Telemóvel/Telefone: {phone} <input className="label" id="change-phone" type="number" maxLength="9"/>
                </div>
                <div id="nif_ChangeProfile">
                    NIF: {nif} <input className="label" id="change-nif" type="number" maxLength="9"/>
                </div>
                <div id="type_ChangeProfile">
                    Tipo de utilizador: {type} <p className="label"></p>
                </div>

                <div className="btn-group" id="confirmAndCancel_ChangeProfile">
                    <div id="confirmChanges_ChangeProfile">
                        <Link to="/profile">
                            <button type="button" className="btn btn-success btn-sm">Confirmar Alterações</button>
                        </Link>
                    </div>

                    <div id="cancelChanges_ChangeProfile">
                        <Link to="/profile">
                            <button type="button" className="btn btn-secondary btn-sm">Cancelar Alterações</button>
                        </Link>
                    </div>
                </div>

            </div>

        </>

    )
}

export default ChangeProfile