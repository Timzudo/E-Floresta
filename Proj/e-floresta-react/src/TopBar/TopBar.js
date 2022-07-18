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
                    <Button variant="success" id="option1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                             className="bi bi-house-fill" viewBox="1 1.5 16 16">
                            <path fillRule="evenodd"
                                  d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6zm5-.793V6l-2-2V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"/>
                            <path fillRule="evenodd"
                                  d="M7.293 1.5a1 1 0 0 1 1.414 0l6.647 6.646a.5.5 0 0 1-.708.708L8 2.207 1.354 8.854a.5.5 0 1 1-.708-.708L7.293 1.5z"/>
                        </svg>
                        Página Inicial</Button>
                </Link>

                {role.includes("A")?
                    <Dropdown>
                        <Dropdown.Toggle className="dropdown_TopBar">

                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                 className="bi bi-tree-fill" viewBox="1 2 16 14">
                                <path
                                    d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5z"/>
                            </svg>
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

                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                 className="bi bi-tree-fill" viewBox="1 2 16 14">
                                <path
                                    d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5z"/>
                            </svg>
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
                    <Button variant="success" id="option2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             className="bi bi-map-fill" viewBox="0 0 18 18">
                            <path fillRule="evenodd"
                                  d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.502.502 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5V.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.498.498 0 0 0-.196 0L5 14.09zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1-.5-.1z"/>
                        </svg>
                        Registar Parcela</Button>
                </Link> : <></>}


                {role === 'D' ? <Link to="/my-parcels">
                    <Button variant="success" id="option3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                             className="bi bi-tree-fill" viewBox="1 2 16 14">
                            <path
                                d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5z"/>
                        </svg>
                        Minhas Parcelas</Button>
                </Link> : <></>}

                {role === 'C' ? <Link to="/parcels-entity">
                    <Button variant="success" id="option5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                             className="bi bi-tree-fill" viewBox="1 2 16 14">
                            <path
                                d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5z"/>
                        </svg>
                        Minhas Parcelas</Button>
                </Link> : <></>}


                {role === 'C' ? <Link to="/proposed-parcels-entity">
                    <Button variant="success" id="option6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             className="bi bi-bookmark-check-fill" viewBox="1 0 16 17">
                            <path fillRule="evenodd"
                                  d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5zm8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
                        </svg>
                        Parcelas Pendentes</Button>
                </Link> : <></>}


                {role.includes('A') || role.includes('B') ? <Link to="/reports-technician">
                    <Button variant="success" id="option13">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             className="bi bi-flag-fill" viewBox="2 0 16 16">
                            <path
                                d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12.435 12.435 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A19.626 19.626 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a19.587 19.587 0 0 0 1.349-.476l.019-.007.004-.002h.001"/>
                        </svg>
                        Denúncias</Button>
                </Link> : <></>}


                {role.includes('A') ? <Link to="/find-user">
                    <Button variant="success" id="option19">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             className="bi bi-search" viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                        Encontrar Utilizador</Button>
                </Link> : <></>}


                {role.includes('D') ? <Link to="/statistics">
                    <Button variant="success" id="option9">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" fill="currentColor"
                             className="bi bi-bar-chart-line-fill" viewBox="2 1 16 16">
                            <path
                                d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z"/>
                        </svg>
                        Estatísticas</Button>
                </Link> : <></>}

                {role === 'C' ? <Link to="/statistics-entity">
                    <Button variant="success" id="option11">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" fill="currentColor"
                             className="bi bi-bar-chart-line-fill" viewBox="2 1 16 16">
                            <path
                                d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z"/>
                        </svg>
                        Estatísticas</Button>
                </Link> : <></>}

                {role.includes('B') ? <Link to="/statistics-technician">
                    <Button variant="success" id="option14">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" fill="currentColor"
                             className="bi bi-bar-chart-line-fill" viewBox="2 1 16 16">
                            <path
                                d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z"/>
                        </svg>
                        Estatísticas</Button>
                </Link> : <></>}

                {role.includes('A') ? <Link to="/statistics-admin">
                    <Button variant="success" id="option12">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" fill="currentColor"
                             className="bi bi-bar-chart-line-fill" viewBox="2 1 16 16">
                            <path
                                d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z"/>
                        </svg>
                        Estatísticas</Button>
                </Link> : <></>}


                <Link to="/rankings">
                    <Button variant="success" id="option10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                             className="bi bi-list-ol" viewBox="1 0 16 16">
                            <path fillRule="evenodd"
                                  d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
                            <path
                                d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
                        </svg>
                        Rankings</Button>
                </Link>

                <Link to="/faq">
                    <Button variant="success" id="option20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor"
                             className="bi bi-question-lg" viewBox="1 2 16 16">
                            <path fillRule="evenodd"
                                  d="M4.475 5.458c-.284 0-.514-.237-.47-.517C4.28 3.24 5.576 2 7.825 2c2.25 0 3.767 1.36 3.767 3.215 0 1.344-.665 2.288-1.79 2.973-1.1.659-1.414 1.118-1.414 2.01v.03a.5.5 0 0 1-.5.5h-.77a.5.5 0 0 1-.5-.495l-.003-.2c-.043-1.221.477-2.001 1.645-2.712 1.03-.632 1.397-1.135 1.397-2.028 0-.979-.758-1.698-1.926-1.698-1.009 0-1.71.529-1.938 1.402-.066.254-.278.461-.54.461h-.777ZM7.496 14c.622 0 1.095-.474 1.095-1.09 0-.618-.473-1.092-1.095-1.092-.606 0-1.087.474-1.087 1.091S6.89 14 7.496 14Z"/>
                        </svg>
                        FAQ</Button>
                </Link>

                <Link to="/about-us">
                    <Button variant="success" id="option4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                             className="bi bi-people-fill" viewBox="0 1 17 17">
                            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path fillRule="evenodd"
                                  d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                            <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                        </svg>
                        Sobre Nós</Button>
                </Link>
            </ButtonGroup>


            <Dropdown className="my-account-dropdown_TopBar">
                <Dropdown.Toggle className="dropdown_TopBar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                         className="bi bi-person-circle" viewBox="-1 0 18 20">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                        <path fillRule="evenodd"
                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                    </svg>
                    Minha Conta
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