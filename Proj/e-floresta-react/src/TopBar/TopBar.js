import LogoImage from './logo.png'
import './TopBar.css'
import {Link} from "react-router-dom";
import {Button, ButtonGroup, Dropdown} from "react-bootstrap";

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

                  <Link to="/map">
                      <Button id="option2">Registar Parcela</Button>
                  </Link>

                  <Link to="/my-parcels">
                      <Button id="option3">Minhas Parcelas</Button>
                  </Link>

                  <Link to="/profile">
                      <Button id="option4">Perfil</Button>
                  </Link>

                  <Link to="/about-us">
                      <Button id="option5">Sobre</Button>
                  </Link>
              </ButtonGroup>

              <Dropdown className="my-account-dropdown_TopBar">
                  <Dropdown.Toggle className="dropdown_TopBar">
                      A Minha Conta
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-content_TopBar">
                      <Dropdown.Item href="/profile">Perfil</Dropdown.Item>
                      <Dropdown.Item href="/" onClick={ () => localStorage.removeItem('token')}>Encerrar sessão</Dropdown.Item>
                  </Dropdown.Menu>
              </Dropdown>

          </div>
    )
 }

 export default TopBar