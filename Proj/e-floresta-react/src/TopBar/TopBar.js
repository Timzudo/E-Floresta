import LogoImage from './logo.png'
import './TopBar.css'
import {Link} from "react-router-dom";
import {Button, ButtonGroup, Dropdown} from "react-bootstrap";
import React, {Component} from 'react';

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

                {localStorage.getItem('role') == 'D' ? <Link to="/my-parcels">
                    <Button id="option3">Minhas Parcelas</Button>
                </Link> : <></>}

                {localStorage.getItem('role') == 'C' ? <Link to="/parcels-entity">
                    <Button id="option5">Minhas Parcelas</Button>
                </Link> : <></>}

                {localStorage.getItem('role') == 'C' ? <Link to="/proposed-parcels-entity">
                    <Button id="option6">Parcelas Pendentes</Button>
                </Link> : <></>}

                {localStorage.getItem('role') == 'B' ? <Link to="/approve-parcels">
                    <Button id="option7">Parcelas Pendentes</Button>
                </Link> : <></>}

                {localStorage.getItem('role') == 'B' ? <Link to="/all-parcels">
                    <Button id="option8">Visualizar Parcelas</Button>
                </Link> : <></>}

                <Link to="/about-us">
                    <Button id="option4">Sobre</Button>
                </Link>
            </ButtonGroup>

            <Dropdown className="my-account-dropdown_TopBar">
                <Dropdown.Toggle className="dropdown_TopBar">
                    A Minha Conta
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-content_TopBar">
                    <Dropdown.Item href="/profile">Perfil</Dropdown.Item>
                    <Dropdown.Item href="/" onClick={() => localStorage.removeItem('token')}><b>Encerrar
                        sessão</b></Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

        </div>
    )
}

export default TopBar