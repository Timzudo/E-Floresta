import "./MakeReport.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React from 'react'
import {Button, Form} from "react-bootstrap";
import {Link} from "react-router-dom";

const MakeReport = () => {

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="report-body_MakeReport">

                <h2 className="title_MakeReport"><b>Reporte uma parcela</b></h2>
                <p className="description_MakeReport">Acha que algo está errado? Conte-nos o problema. <br/>
                    A sua contribuição ajuda-nos a melhorar o funcionamento do site!</p>

                <Form  /* onSubmit={submitHandler} */ >

                    <Form.Group className="report-parcel-form" >
                        <Form.Label>Tópico do problema (descrição breve):</Form.Label>
                        <Form.Control required type="text" placeholder="Tópico" id="topic_MakeReport" />
                    </Form.Group>

                    <Form.Group className="report-parcel-form" >
                        <Form.Label>Descreva o problema:</Form.Label>
                        <Form.Control as="textarea" rows={4} placeholder="Mensagem" id="msg_MakeReport" />
                    </Form.Group>

                    <Button id="submit_MakeReport" variant="success" type="submit">
                        Submeter
                    </Button>

                    <Link to="/homepage">
                        <Button variant="secondary" id="cancel_MakeReport">
                            Cancelar
                        </Button>
                    </Link>


                </Form>

            </div>

        </>
    )
}

export default MakeReport