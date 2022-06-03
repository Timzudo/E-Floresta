import LogoImage from './logo.png'
import './TopBar.css'
import {Link} from "react-router-dom";

const TopBar = () => {

    return (
          <div className="topBar_top">

              <div>
                  <Link to="/homepage"><img src={LogoImage} alt="E-Floresta Logo" className="topBar_logo"/></Link>
              </div>

              <div className="btn-group">
                  <Link to="/homepage">
                      <button id="option1" type="button" className="btn btn-outline-success">Página Inicial</button>
                  </Link>
                  <Link to="/profile">
                      <button id="option2" type="button" className="btn btn-outline-success">Meu Perfil</button>
                  </Link>
                  <Link to="/map">
                      <button id="option3" type="button" className="btn btn-outline-success">Mapa</button>
                  </Link>
                  <Link to="/about-us">
                      <button id="option4" type="button" className="btn btn-outline-success">Sobre</button>
                  </Link>
              </div>

              <div className="close-session-button">
                  <Link to="/">
                      <button type="button" className="btn btn-light">Encerrar sessão</button>
                  </Link>
              </div>

          </div>
    )
 }

 export default TopBar