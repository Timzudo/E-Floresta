import {Link} from "react-router-dom";
import './TopBar.css'
import Image from "../logo.png";

const TopBar = () => {

    let xmlhttp = new XMLHttpRequest();

    function logout() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    sessionStorage.removeItem('token');
                    window.location.href = "index.html";
                }
                else{
                    alert("Não foi possível encerrar a sessão.");
                }
            }
        }

        xmlhttp.open("DELETE", "https://modified-talon-344017.oa.r.appspot.com/rest/logout/" + JSON.parse(sessionStorage.getItem('token')));
        xmlhttp.send();
    }

    return (
        <>
            <div className="logo">
                <Link to="/"><img src={Image} alt="E-Floresta Logo" className="logo" /></Link>
            </div>

            <div className="session-button">
                <Link to="/">
                    <button type="button" className="btn btn-light" onClick={logout}> Encerrar sessão </button>
                </Link>
            </div>

            <div className="pages-buttons">
                <Link to="/">
                    <button id="option1" type="button"> Página Inicial </button>
                </Link>

                <Link to="/profile">
                    <button id="option2" type="button"> Perfil </button>
                </Link>
            </div>
        </>
      
    )
 }

 export default TopBar