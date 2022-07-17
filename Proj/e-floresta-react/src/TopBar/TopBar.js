import LogoImage from './logo.png'
import './TopBar.css'
import {Link, useNavigate} from "react-router-dom";
import {Button, ButtonGroup, Dropdown} from "react-bootstrap";
import React from 'react';

const TopBar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role') != null?localStorage.getItem('role'):'MISSING';
    return (
        <div className="topBar_top">

            <div>
                <Link to="/homepage"><img src={LogoImage} alt="E-Floresta Logo" className="topBar_logo"/></Link>
            </div>

            <ButtonGroup className="buttons_TopBar" size="lg">
                <Link to="/homepage">
                    <Button variant="success" id="option1">Página Inicial</Button>
                </Link>

                {role.includes("A")?
                    <Dropdown>
                        <Dropdown.Toggle className="dropdown_TopBar">
                            Parcelas
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-parcels-content_TopBar">
                            <Dropdown.Item onClick={() => navigate("/map")}><b>Registar Parcela</b></Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/all-parcels-admin")}><b>Visualizar Parcelas</b></Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/approve-parcels-admin")}><b>Aprovar Parcelas</b></Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                 : <></>}

                {role.includes("B")?
                    <Dropdown>
                        <Dropdown.Toggle className="dropdown_TopBar">
                            Parcelas
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-parcels-content_TopBar">
                            <Dropdown.Item onClick={() => navigate("/map")}><b>Registar Parcela</b></Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/all-parcels")}><b>Visualizar Parcelas</b></Dropdown.Item>
                            <Dropdown.Item onClick={() => navigate("/approve-parcels")}><b>Aprovar Parcelas</b></Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    : <></>}

                {role === 'D' ? <Link to="/map">
                    <Button variant="success" id="option2">Registar Parcela</Button>
                </Link> : <></>}


                {role === 'D' ? <Link to="/my-parcels">
                    <Button variant="success" id="option3">Minhas Parcelas</Button>
                </Link> : <></>}

                {role === 'C' ? <Link to="/parcels-entity">
                    <Button variant="success" id="option5">Minhas Parcelas</Button>
                </Link> : <></>}


                {role === 'C' ? <Link to="/proposed-parcels-entity">
                    <Button variant="success" id="option6">Parcelas Pendentes</Button>
                </Link> : <></>}


                {role.includes('A') || role.includes('B') ? <Link to="/reports-technician">
                    <Button variant="success" id="option13">Denúncias</Button>
                </Link> : <></>}


                {role.includes('A') ? <Link to="/find-user">
                    <Button variant="success" id="option19">Encontrar Utilizador</Button>
                </Link> : <></>}


                {role.includes('D') ? <Link to="/statistics">
                    <Button variant="success" id="option9">Estatísticas</Button>
                </Link> : <></>}

                {role === 'C' ? <Link to="/statistics-entity">
                    <Button variant="success" id="option11">Estatísticas</Button>
                </Link> : <></>}

                {role.includes('B') ? <Link to="/statistics-technician">
                    <Button variant="success" id="option14">Estatísticas</Button>
                </Link> : <></>}

                {role.includes('A') ? <Link to="/statistics-admin">
                    <Button variant="success" id="option12">Estatísticas</Button>
                </Link> : <></>}


                <Link to="/rankings">
                    <Button variant="success" id="option10">Rankings</Button>
                </Link>

                <Link to="/faq">
                    <Button variant="success" id="option20">FAQ</Button>
                </Link>

                <Link to="/about-us">
                    <Button variant="success" id="option4">Sobre Nós</Button>
                </Link>
            </ButtonGroup>


            <Dropdown className="my-account-dropdown_TopBar">
                <Dropdown.Toggle className="dropdown_TopBar">
                    A Minha Conta
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-content_TopBar">
                    <Dropdown.Item onClick={() => navigate("/profile")}>Perfil</Dropdown.Item>
                    <Dropdown.Item onClick={() => {localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('state'); navigate("/")}}><b>Encerrar sessão</b></Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

        </div>
    )
}

export default TopBar