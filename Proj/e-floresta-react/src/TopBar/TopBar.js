import LogoImage from './logo.png'
import './TopBar.css'
import {Link} from "react-router-dom";
import {Button, ButtonGroup} from "react-bootstrap";

const TopBar = () => {

    return (
          <div className="topBar_top">

              <div>
                  <Link to="/homepage"><img src={LogoImage} alt="E-Floresta Logo" className="topBar_logo"/></Link>
              </div>

              <ButtonGroup className="buttons_TopBar" size="lg">
                  <Link to="/homepage">
                      <Button id="option1" className="topBar-buttons">Página Inicial</Button>
                  </Link>

                  <Link to="/profile">
                      <Button id="option2" className="topBar-buttons">Perfil</Button>
                  </Link>

                  <Link to="/map">
                      <Button id="option3" className="topBar-buttons">Mapa</Button>
                  </Link>

                  <Link to="/about-us">
                      <Button id="option4" className="topBar-buttons">Sobre</Button>
                  </Link>
              </ButtonGroup>

              <div className="close-session-button">
                  <Link to="/">
                      <button type="button" onClick={ () => localStorage.removeItem('token')} className="btn btn-light">Encerrar sessão</button>
                  </Link>
              </div>

          </div>
    )
 }

 export default TopBar