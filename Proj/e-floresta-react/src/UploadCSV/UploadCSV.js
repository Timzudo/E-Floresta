import './UploadCSV.css'
import TopBar from '../TopBar/TopBar.js'
import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import React from 'react'
import {Button, Form} from "react-bootstrap";

const UploadCSV = () => {
    return(
        <>

            <CheckIfLoggedOut />
            <TopBar />

            <div className="bg-img_UploadCSV">
                <div className="body_UploadCSV">
                    <br/>
                    <h2 className="title_UploadCSV"><b>Carregar um ficheiro CSV</b></h2>
                    <br/>
                    <Form>
                        <Form.Group className="file-input_UploadCSV">
                            <Form.Label>Introduza aqui o seu ficheiro CSV (deverá ser do tipo .txt):</Form.Label>
                            <Form.Control type="file" accept = ".txt" size="lg" />
                        </Form.Group>
                        <Button id="button_UploadCSV" type="button" className="btn btn-success">Carregar ficheiro</Button>
                    </Form>
                </div>
            </div>
        </>

    )
}

export default UploadCSV