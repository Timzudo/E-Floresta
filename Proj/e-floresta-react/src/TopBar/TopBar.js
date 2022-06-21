import LogoImage from './logo.png'
import './TopBar.css'
import {Link} from "react-router-dom";
import {Button, ButtonGroup, Dropdown} from "react-bootstrap";
import React, { Component }  from 'react';

const TopBar = () => {

    const { language } = this.props;

    return (
          <div className="topBar_top">

              <div>
                  <Link to="/homepage"><img src={LogoImage} alt="E-Floresta Logo" className="topBar_logo"/></Link>
              </div>

              <ButtonGroup className="buttons_TopBar" size="lg">
                  <Link to="/homepage">
                      <Button id="option1">{language == "EN" ? "Homepage": "Página Inicial"}</Button>
                  </Link>

                  <Link to="/map">
                      <Button id="option2">{language == "EN" ? "Register Plot": "Registar Parcela"}</Button>
                  </Link>

                  <Link to="/my-parcels">
                      <Button id="option3">{language == "EN" ? "My Plots": "Minhas Parcelas"}</Button>
                  </Link>

                  <Link to="/about-us">
                      <Button id="option4">{language == "EN" ? "About": "Sobre"}</Button>
                  </Link>
              </ButtonGroup>

              <Dropdown className="my-account-dropdown_TopBar">
                  <Dropdown.Toggle className="dropdown_TopBar">
                      {language == "EN" ? "My Account": "A Minha Conta"}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-content_TopBar">
                      <Dropdown.Item href="/profile">{language == "EN" ? "Profile": "Perfil"}</Dropdown.Item>
                      <Dropdown.Item href="/" onClick={ () => localStorage.removeItem('token')}><b>{language == "EN" ? "Log out": "Encerrar sessão"}</b></Dropdown.Item>
                  </Dropdown.Menu>
              </Dropdown>

          </div>
    )
 }

 export default TopBar