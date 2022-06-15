import "./MyParcels.css"
import Image from './terreno.png'

import CheckIfLoggedOut from "../util/CheckIfLoggedOut";
import TopBar from "../TopBar/TopBar";
import {Button, Card} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useEffect, useState} from 'react'

const MyParcels = () => {

    const [parcelList, setPList] = useState([]);

    let xmlhttp = new XMLHttpRequest();

    let arr = [];

    useEffect(() => {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const obj = JSON.parse(xmlhttp.responseText);
                    for(let i = 0; i<obj.length; i++){
                        arr.push(<Card className="parcel-card_MyParcels" style={{ width: '20rem' }}>
                            <Card.Img className="parcel_picture" variant="top" src={obj[i].photoURL} />
                            <Card.Body>
                                <Card.Title>{obj[i].name}</Card.Title>
                                <Card.Text>
                                    <label>Área: {obj[i].area}m²</label><br/>
                                    <label>Perímetro: {obj[i].perimeter}m</label><br/>
                                    <label>Freguesia: {obj[i].freguesia}</label><br/>
                                    <label>Concelho: {obj[i].concelho}</label><br/>
                                    <label>Distrito: {obj[i].distrito}</label><br/>
                                </Card.Text>
                                <Link to="/edit-parcel">
                                    <Button id="edit-parcel_MyParcels" variant="primary">Editar Parcela</Button>
                                </Link>
                            </Card.Body>
                        </Card>);
                    }
                    setPList(arr);
                }
            }
        }

        var myObj = {token:localStorage.getItem('token')};
        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/owned");
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    })

    return(
        <>
            <CheckIfLoggedOut />
            <TopBar />

            <div className="body_MyParcels">
                <div className="container_MyParcels">
                    {parcelList}
                </div>
            </div>
        </>
    )
}

export default MyParcels