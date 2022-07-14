import './FAQUnlogged.css'
import React from 'react'
import {Accordion, Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import Image from "../logo.png";

const FAQUnlogged = () => {
    return(
        <>

            <div className="home_top">
                <div>
                    <Link to="/"><img src={Image} alt="E-Floresta Logo" className="home_logo" /></Link>
                </div>
            </div>

            <div className="bg-img_FAQ">
                <div className="body_FAQ">
                    <br/>
                    <h2 className="title_FAQ"><b>Perguntas frequentes</b></h2>
                    <p className="description_FAQ">Nesta secção pode encontrar algumas das perguntas feitas com mais frequência e as suas respetivas
                        respostas. Esperemos que lhe sejam úteis.
                    </p>

                    <Accordion className="accordion_FAQ">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Que dados preciso de fornecer para criar uma conta? </Accordion.Header>
                            <Accordion.Body>
                                Para criar uma conta deverá fornecer pelo menos o seu nome completo e um e-mail funcional.
                                Poderá adicionalmente, acrescentar o seu telemóvel/telefone e NIF, se assim o entender, no momento da
                                criação da conta ou mais tarde, editando o seu perfil.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>O que é necessário para registar uma parcela?</Accordion.Header>
                            <Accordion.Body>
                                Para registar uma parcela deverá fornecer as seguintes informações: a localização da parcela (inclui distrito,
                                concelho, freguesia, secção e número de artigo), as coordenadas dos seus limites (que podem ser marcadas num
                                mapa próprio, ou inseridas manualmente), o tipo de cobertura do solo, escolher uma utilização atual e
                                prévia do solo dentre as opções disponíveis no site, uma foto identificativa da parcela e um PDF que funcione
                                como comprovativo de que se trata do dono da mesma. Todos os campos descritos préviamente são obrigatórios.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Quem irá gerir a minha parcela?</Accordion.Header>
                            <Accordion.Body>
                                Cada parcela registada poderá ser gerida por quem a registou/dono ou, caso o deseje, poderá ser gerida
                                por uma entidade competente disponível na sua freguesia ou concelho, através de um pedido que terá de ser
                                aceite pela mesma. Parcelas diferentes podem utilizar métodos de gerenciamento diferentes ou até ser geridas
                                por entidades distintas.
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    <div className="button_FAQUnlogged">
                        <Link to="/">
                            <Button id="faqButton" type="button">Voltar à página inicial</Button>
                        </Link>
                    </div>

                </div>
            </div>

        </>
    )
}

export default FAQUnlogged