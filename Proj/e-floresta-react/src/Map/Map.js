import React, {useEffect} from 'react'
import {GoogleMap, LoadScript} from '@react-google-maps/api';
import {Marker} from '@react-google-maps/api';
import {useState} from 'react'
import {Polygon} from '@react-google-maps/api';
import "./Map.css"
import {Button, Form} from "react-bootstrap";
import {getAreaOfPolygon, getDistance, getPathLength} from 'geolib';

const google = window.google;

const containerStyle = {
    width: '75vw',
    height: '93.5vh'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const options = {
    fillColor: "Khaki",
    fillOpacity: 0.3,
    strokeColor: "DarkOrange",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}


const Map = () => {
    const submitHandler = (e) => {
        e.preventDefault();
    }

    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);

    React.useEffect(() => {
        setPerimeter(getPathLength(paths) + (paths.length>1 ? getDistance(paths[paths.length-1], paths[0]) : 0));
        setArea(Math.round(getAreaOfPolygon(paths) * 100) / 100);
    }, [paths]);


    function addMarker(lat, lng) {
        const google = window.google;

        console.log(lat, lng);

        setMarker(markerList.concat(<Marker key={markerList.length} id={markerList.length}
                                            position={{
                                                lat: lat,
                                                lng: lng
                                            }}
                                            icon={{
                                                path: google.maps.SymbolPath.CIRCLE,
                                                fillColor: "#ff8000",
                                                fillOpacity: 1.0,
                                                strokeWeight: 0,
                                                scale: 5
                                            }}/>))

        setPaths(paths.concat({
            lat: lat,
            lng: lng
        }));
    }


    function rollback() {
        setMarker(markerList.filter((element, index) => index < markerList.length - 1));
        setPaths(paths.filter((element, index) => index < paths.length - 1));
    }

    function submitParcel() {
        let xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Parcela registada com sucesso.");
                    window.location.href = "/map";
                } else if(xmlhttp.status == 400) {
                    alert("Todos os campos obrigatórios devem ser preenchidos.");
                } else if(xmlhttp.status == 403 || xmlhttp.status == 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    window.location.href = "/";
                } else if(xmlhttp.status == 409) {
                    alert("Já possui uma parcela com o mesmo nome.")
                }
            }
        }

        var myObj = {name:document.getElementById("formParcelName").value,
            distrito:document.getElementById("formDistritoDropdown").value,
            concelho:document.getElementById("formConcelhoDropdown").value,
            freguesia:document.getElementById("formFreguesiaDropdown").value,
            /*photo:document.getElementById("formParcelPhoto").value,
            pdf:document.getElementById("formParcelPdf").value,*/
            coordinates:paths,
            area:area,
            perimeter:perimeter
        };

        /*for (let i = 0; i < paths.length; i++) {
            myObj.coordinates.push([paths[i].lat, paths[i].lng]);
        }*/

        var myJson = JSON.stringify(myObj);

        xmlhttp.open("POST", "https://moonlit-oven-349523.oa.r.appspot.com/rest/parcel/register?token=" + localStorage.getItem("token"), true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);
    }


    return (
        <div className="mapDiv_Map"><LoadScript
            googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                tilt={0}
                onClick={ev => {
                    addMarker(ev.latLng.lat(), ev.latLng.lng())
                }}
            >
                <Polygon
                    paths={paths}
                    options={options}
                />
                {markerList}
                <></>
            </GoogleMap>
        </LoadScript>
            <div id="sideBar">
                <div id="parcelInfo">
                    <div id="parcelArea">
                        <div className="MapInfo_Map">Área</div>
                        <div className="MapInfo_Map">{area}m²</div>
                    </div>
                    <div id="parcelPerimeter">
                        <div className="MapInfo_Map">Perímetro</div>
                        <div className="MapInfo_Map">{perimeter}m</div>
                    </div>
                </div>
                <button type="button" id="rollback" className={paths.length > 0 ? "btn btn-success" : "btn btn-secondary"} onClick={rollback}>Voltar atrás</button>
            </div>


            <div className="submit_Map">
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="formParcelName">
                        <Form.Label> <strong>Nome da Parcela </strong> </Form.Label>
                        <Form.Control className="map_fields" required type="text" placeholder="Nome da parcela" />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formDistritoDropdown">
                        <Form.Label> <strong>Distrito</strong> </Form.Label>
                        <Form.Select className="map_fields">
                            <option>Lisboa</option>
                            <option>Porto</option>
                            <option>Algarve</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formConcelhoDropdown">
                        <Form.Label> <strong>Concelho</strong> </Form.Label>
                        <Form.Select className="map_fields">
                            <option>Concelho1</option>
                            <option>Concelho2</option>
                            <option>Concelho3</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFreguesiaDropdown">
                        <Form.Label> <strong>Freguesia</strong> </Form.Label>
                        <Form.Select className="map_fields">
                            <option>Freguesia1</option>
                            <option>Freguesia2</option>
                            <option>Freguesia3</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="position-relative mb-3" controlId="formParcelPhoto">
                        <Form.Label> <strong>Foto</strong> </Form.Label>
                        <Form.Control
                            className="map_fields"
                            type="file"
                            required
                            name="file"
                            accept = ".png, .jpg, .jpeg"
                        />
                    </Form.Group>

                    <Form.Group className="position-relative mb-3" controlId="formParcelPdf">
                        <Form.Label> <strong>PDF</strong> </Form.Label>
                        <Form.Control
                            className="map_fields"
                            type="file"
                            required
                            name="file"
                            accept = ".pdf"
                        />
                    </Form.Group>

                    <Button variant="success" type="submit" onClick={submitParcel}>
                        Submeter
                    </Button>
                </Form>
            </div>

        </div>

    )
}

export default React.memo(Map)