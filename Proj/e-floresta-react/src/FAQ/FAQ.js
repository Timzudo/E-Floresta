import './FAQ.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React from 'react'
import {Accordion} from "react-bootstrap";

const FAQ = () => {
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_FAQ">
                <div className="body_FAQ">
                    <br/>
                    <h2 className="title_FAQ"><b>Perguntas frequentes</b></h2>
                    <p className="description_FAQ">Nesta secção pode encontrar algumas das perguntas feitas com mais frequência e as suas respetivas
                        respostas. Esperemos que lhe sejam úteis.
                    </p>

                    <Accordion className="accordion_FAQ">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Para registar uma parcela é necessário preencher todos os campos? </Accordion.Header>
                            <Accordion.Body>
                                Sim, todos os campos apresentados devem ser preenchidos.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Existe uma parcela sobreposta à minha. O que posso fazer?</Accordion.Header>
                            <Accordion.Body>
                                Na aba "Minhas Parcelas" pode visualizar todas as suas parcelas atuais. Clicando no botão "Parcelas Próximas"
                                para visualizar parcelas adjacentes às suas. Pode clicar nelas para obter mais informações ou denunciar a parcela.
                                Clicar no botão de "Reportar" irá encaminhá-lo para uma página nova onde poderá registar a sua queixa. Esta será
                                posteriormente avaliada por um técnico ou administrador que irá avaliar a pertinência da denúncia.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>A minha parcela está em estado pendente ou rejeitado. O que aconteceu?</Accordion.Header>
                            <Accordion.Body>
                                Se a sua parcela estiver em estado pendente, não se preocupe, ela irá ser avaliada por um técnico ou
                                administrador em breve, que após verificar que tudo está correto irá aprovar a sua parcela. Saberá que
                                ela foi aprovada quando o estado dela aparecer como "Aprovada". Se a sua parcela estiver em estado reprovado,
                                algo correu mal e o nosso técnico ou administrador rejeitou o seu registo. Possivelmente alguma informação ou
                                coordenada foi registada erradamente. Tente editar as informações de forma a que fiquem corretas. Depois,
                                é só aguardar.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Enganei-me a registar as coordenadas da minha parcela. O que posso fazer?</Accordion.Header>
                            <Accordion.Body>
                                Vá à aba "Minhas Parcelas" e na parcela em causa, clique no botão "Editar". Na parte superior da página
                                que apareceu existe um mapa onde é possível clicar para marcar as novas coordenadas. Atenção: todos os pontos
                                da parcela devem ser remarcados, mesmo aqueles que já estão, à partida, corretos, ou seja, toda a parcela deve
                                ser redesenhada. Clique no botão "Confirmar Alterações" no fundo da página.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>Como posso pedir para que alguém gerencie a minha parcela? E sob que condições?</Accordion.Header>
                            <Accordion.Body>
                                 Cada pedido de gerenciamento é exclusivo para a parcela requisitada, logo se quiser que todas as suas parcelas
                                 sejam geridas por uma entidade, deve efetuar esse pedido para todas. Para isso, dirija-se à aba "Minhas Parcelas"
                                 e clique no botão "Editar" da parcela em causa. Se esta parcela ainda não estiver atribuída a nenhuma entidade
                                 (de notar que só é possível atribuir um gerente por parcela) as entidades disponíveis na sua localização serão
                                 listadas. Nesse caso, desde que existam entidades disponíveis, é possível escolher uma da lista. Isso irá enviar
                                 um pedido à entidade. Para concluir esta operação, deverá aguardar que a entidade a que enviou o seu pedido o aceite.
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>É possível anular o gerenciamento de uma parcela por uma entidade?</Accordion.Header>
                            <Accordion.Body>
                                Sim. Para isso, dirija-se à aba "Minhas Parcelas" e clique no botão "Editar" da parcela em causa. Se esta parcela
                                estiver atribuída a uma entidade, ela aparecerá no campo devido. Para remover a entidade, basta clicar em
                                "Remover gerente".
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>

        </>
    )
}

export default FAQ