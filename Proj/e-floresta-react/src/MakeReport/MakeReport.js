import "./MakeReport.css"
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import React from 'react'
import {Button, Form} from "react-bootstrap";
import {Link, useLocation, useNavigate} from "react-router-dom";

const MakeReport = () => {
    const search = useLocation().search;
    const name = new URLSearchParams(search).get('id');
    const navigate = useNavigate();
    function sendReport(){
        let myObj = {token:localStorage.getItem('token'),
                        topic:document.getElementById("topic_MakeReport").value,
                        text:document.getElementById("msg_MakeReport").value};

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myObj),
        };

        fetch("https://moonlit-oven-349523.appspot.com/rest/parcel/report/"+name, options)
            .then((r) => {
                if(r.ok){
                    alert("success!");
                    navigate("/");
                }
            }).catch(console.log);
    }

    const submitHandler = (e) => {
        e.preventDefault();
    }
    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_MakeReport">
                <div className="report-body_MakeReport">

                    <br/>
                    <h2 className="title_MakeReport"><b>Reporte uma parcela</b></h2>
                    <p className="description_MakeReport">Acha que algo está errado? Conte-nos o problema. <br/>
                        A sua contribuição ajuda-nos a melhorar o funcionamento do site!</p>

                    <Form onSubmit={submitHandler} >

                        <Form.Group controlId="makereport_topic" className="report-parcel-form" >
                            <Form.Label>Tópico do problema (descrição breve):</Form.Label>
                            <Form.Control required type="text" placeholder="Tópico" id="topic_MakeReport" maxLength="64"/>
                        </Form.Group>

                        <Form.Group controlId="makereport_text" className="report-parcel-form" >
                            <Form.Label>Descreva o problema:</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="Mensagem" id="msg_MakeReport" maxLength="512"/>
                        </Form.Group>

                        <Button id="submit_MakeReport" variant="success" type="submit" onClick={sendReport}>
                            Submeter
                        </Button>

                        <Link to="/homepage">
                            <Button variant="secondary" id="cancel_MakeReport">
                                Cancelar
                            </Button>
                        </Link>

                    </Form>

                </div>
            </div>

        </>
    )
}

export default MakeReport