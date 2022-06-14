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
                      <Button id="option1">Página Inicial</Button>
                  </Link>

                  <Link to="/profile">
                      <Button id="option2">Perfil</Button>
                  </Link>

                  <Link to="/map">
                      <Button id="option3">Registar Parcela</Button>
                  </Link>

                  <Link to="/my-parcels">
                      <Button id="option4">Minhas Parcelas</Button>
                  </Link>

                  <Link to="/about-us">
                      <Button id="option5">Sobre</Button>
                  </Link>
              </ButtonGroup>

              <div className="close-session-button">
                  <Link to="/">
                      <Button id="close-sessionButton" type="button" onClick={ () => localStorage.removeItem('token')}>Encerrar sessão</Button>
                  </Link>
              </div>

          </div>
    )
 }

 export default TopBar