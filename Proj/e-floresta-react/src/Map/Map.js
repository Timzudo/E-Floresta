import React, {useEffect} from 'react'
import {GoogleMap, LoadScript} from '@react-google-maps/api';
import {Marker} from '@react-google-maps/api';
import {useState} from 'react'
import {Polygon} from '@react-google-maps/api';
import "./Map.css"
import {Button, Form} from "react-bootstrap";
import {getAreaOfPolygon, getDistance, getPathLength} from 'geolib';
import CSVConverter from "../util/CSVConverter";
import {useNavigate} from "react-router-dom";

const google = window.google;

const containerStyle = {
    width: '75vw',
    height: 'calc(100vh - 60px)'
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
    const navigate = useNavigate();
    const obj = JSON.parse(localStorage.getItem('csv'));
    const distritos = Object.keys(obj);
    const distritoList = [];
    for(let i = 0; i<distritos.length; i++) {
        distritoList.push(<option>{distritos[i]}</option>)
    }

    const [file, setFile] = useState();
    const [documentState, setDocument] = useState();
    const submitHandler = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        submitParcel(formData);
    }

    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);

    const [distrito, setDistrito] = useState("");
    const [concelhoOptions, setConcelhoOptions] = useState([]);
    const [freguesiaOptions, setFreguesiaOptions] = useState([]);


    function handleSetDistrito(distrito){
        setDistrito(distrito);
        let listC = Object.keys(obj[distrito]);

        let list = [];
        for(let i = 0; i<listC.length; i++){
            list.push(<option>{listC[i]}</option>);
        }
        setConcelhoOptions(list);
    }

    function handleSetConcelho(concelho){
        console.log(obj);
        console.log(distrito);
        console.log(concelho);
        let listF = Object.keys(obj[distrito][concelho]);

        let list = [];
        for(let i = 0; i<listF.length; i++){
            list.push(<option>{listF[i]}</option>);
        }
        setFreguesiaOptions(list);
    }


    React.useEffect(() => {
        setPerimeter(getPathLength(paths) + (paths.length>1 ? getDistance(paths[paths.length-1], paths[0]) : 0));
        setArea(Math.round(getAreaOfPolygon(paths)));
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

    function submitParcel(f) {
        let xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    alert("Parcela registada com sucesso.");
                    navigate("/map");
                } else if(xmlhttp.status == 400) {
                    alert("Todos os campos obrigatórios devem ser preenchidos.");
                    alert(xmlhttp.responseText);
                } else if(xmlhttp.status == 403 || xmlhttp.status == 404) {
                    alert("Não tem permissões para efetuar esta operação.");
                    localStorage.removeItem("token");
                    navigate("/");
                } else if(xmlhttp.status == 409) {
                    alert("Já possui uma parcela com o mesmo nome.")
                }
            }
        }

        f.append('token', localStorage.getItem('token'));
        f.append('name', document.getElementById("formParcelName").value);
        f.append('distrito', document.getElementById("formDistritoDropdown").value);
        f.append('concelho', document.getElementById("formConcelhoDropdown").value);
        f.append('freguesia', document.getElementById("formFreguesiaDropdown").value);
        f.append('photo', file);
        f.append('coordinates', JSON.stringify(paths));
        f.append('area', area.toString());
        f.append('perimeter', perimeter.toString());
        f.append('document', documentState);
        f.append('usage', document.getElementById("formParcelUsage").value);
        f.append('oldUsage', document.getElementById("formParcelOldUsage").value);
        f.append('cover', document.getElementById("formParcelCover").value);

        for (var pair of f.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }


        xmlhttp.open("POST", "https://moonlit-oven-349523.appspot.com/rest/parcel/register?token=" + localStorage.getItem("token"), true);
        xmlhttp.send(f);
    }


    return (
        <div className="mapDiv_Map">
            <CSVConverter/><LoadScript
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

            <div className="wrapper">
                <div id="sideBar">
                    <div id="parcelInfo">
                        <div id="parcelArea">
                            <div className="MapInfo_Map">Área</div>
                            <div className="MapInfo_Map">{area}m²</div>
                        </div>
                        <br/>
                        <div id="parcelPerimeter">
                            <div className="MapInfo_Map">Perímetro</div>
                            <div className="MapInfo_Map">{perimeter}m</div>
                        </div>
                    </div>
                    <button type="button" id="rollback" className={paths.length > 0 ? "btn btn-success" : "btn btn-secondary"} onClick={rollback}>Voltar atrás</button>
                </div>


                <div className="submit_Map">
                    <Form onSubmit={submitHandler}>
                        <Form.Group className="mt-3" controlId="formParcelName">
                            <Form.Label> <strong>Nome da Parcela</strong> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Nome da parcela" />
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formDistritoDropdown">
                            <Form.Label> <strong>Distrito</strong> </Form.Label>
                            <Form.Select className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                                {distritoList}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formConcelhoDropdown">
                            <Form.Label> <strong>Concelho</strong> </Form.Label>
                            <Form.Select className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                                {concelhoOptions}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formFreguesiaDropdown">
                            <Form.Label> <strong>Freguesia</strong> </Form.Label>
                            <Form.Select className="map_fields">
                                {freguesiaOptions}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelCover">
                            <Form.Label> <strong>Cobertura do solo</strong> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Cobertura do solo" />
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelUsage">
                            <Form.Label> <strong>Utilização do solo</strong> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Utilização do solo" />
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelOldUsage">
                            <Form.Label> <strong>Utilização prévia do solo</strong> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Utilização prévia do solo" />
                        </Form.Group>

                        <Form.Group className="position-relative mt-3" controlId="formParcelPhoto">
                            <Form.Label> <strong>Foto</strong> </Form.Label>
                            <Form.Control
                                className="map_fields"
                                type="file"
                                required
                                name="file"
                                accept = ".png"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </Form.Group>

                        <Form.Group className="position-relative mt-3" controlId="formParcelPdf">
                            <Form.Label> <strong>PDF</strong> </Form.Label>
                            <Form.Control
                                className="map_fields"
                                type="file"
                                required
                                name="file"
                                accept = ".pdf"
                                onChange={(e) => setDocument(e.target.files[0])}
                            />
                        </Form.Group>

                        <Button className="mt-3 mb-3" variant="success" type="submit">
                            Submeter
                        </Button>
                    </Form>
                </div>
            </div>


        </div>

    )
}

export default React.memo(Map)