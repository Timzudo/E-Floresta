import "./MyParcels.css"
import Image from './terreno.png'

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Card} from "react-bootstrap";

const MyParcels = () => {

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="body_MyParcels">
                <div className="container_MyParcels">
                    <Card className="parcel-card_MyParcels" style={{ width: '18rem' }}>
                        <Card.Img variant="top" src={Image} />
                        <Card.Body>
                            <Card.Title>Nome: parcela</Card.Title>
                            <Card.Text>
                                <label>Área: 123m²</label><br/>
                                <label>Perímetro: 123m</label><br/>
                                <label>Freguesia: A</label><br/>
                                <label>Concelho: B</label><br/>
                                <label>Distrito: C</label><br/>
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="parcel-card_MyParcels" style={{ width: '18rem' }}>
                        <Card.Img variant="top" src={Image} />
                        <Card.Body>
                            <Card.Title>Nome: parcela</Card.Title>
                            <Card.Text>
                                <label>Área: 123m²</label><br/>
                                <label>Perímetro: 123m</label><br/>
                                <label>Freguesia: A</label><br/>
                                <label>Concelho: B</label><br/>
                                <label>Distrito: C</label><br/>
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="parcel-card_MyParcels" style={{ width: '18rem' }}>
                        <Card.Img variant="top" src={Image} />
                        <Card.Body>
                            <Card.Title>Nome: parcela</Card.Title>
                            <Card.Text>
                                <label>Área: 123m²</label><br/>
                                <label>Perímetro: 123m</label><br/>
                                <label>Freguesia: A</label><br/>
                                <label>Concelho: B</label><br/>
                                <label>Distrito: C</label><br/>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default MyParcels