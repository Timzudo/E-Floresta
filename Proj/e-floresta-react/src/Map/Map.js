import React from 'react'
import {GoogleMap, LoadScript} from '@react-google-maps/api';
import {Marker} from '@react-google-maps/api';
import {useState} from 'react'
import {Polygon} from '@react-google-maps/api';
import "./Map.css"
import {Button, Form, Spinner} from "react-bootstrap";
import {getAreaOfPolygon, getDistance, getPathLength} from 'geolib';
import CSVConverter from "../util/CSVConverter";
import {useLocation, useNavigate} from "react-router-dom";

const google = window.google;
const containerStyle = {
    width: '70vw',
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
    const [request, setRequest] = useState(false);
    const role = localStorage.getItem('role');
    const search = useLocation().search;
    const queryCoords = new URLSearchParams(search).get('coords');
    const navigate = useNavigate();
    const obj = JSON.parse(localStorage.getItem('csv'));
    const distritos = Object.keys(obj);
    const distritoList = [];
    for(let i = 0; i<distritos.length; i++) {
        distritoList.push(<option>{distritos[i]}</option>)
    }

    const [useGeoFile, setUseGeoFile] = useState(false);
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
        setFreguesiaOptions([]);
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

    function loadGeojson(file){
        setMarker([]);
        setPaths([]);
        const google = window.google;

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            let obj = JSON.parse(evt.target.result);
            console.log(evt.target.result);
            if(obj.type !== "Polygon"){
                alert("Formato inv??lido");
                return null;
            }
            if(obj.coordinates.length > 1){
                alert("Formato inv??lido");
                return null;
            }

            let coordinateList = obj.coordinates[0];


            let arr1 = [];
            let arr2 = [];
            for(let i = 0; i<coordinateList.length-1; i++){
                arr1.push(<Marker key={markerList.length} id={markerList.length}
                                                    position={{
                                                        lat: coordinateList[i][0],
                                                        lng: coordinateList[i][1]
                                                    }}
                                                    icon={{
                                                        path: google.maps.SymbolPath.CIRCLE,
                                                        fillColor: "#ff8000",
                                                        fillOpacity: 1.0,
                                                        strokeWeight: 0,
                                                        scale: 5
                                                    }}/>)
                arr2.push({
                    lat: coordinateList[i][0],
                    lng: coordinateList[i][1]
                });
            }
            setMarker(arr1);
            setPaths(arr2);
        }
    }


    React.useEffect(() => {
        setPerimeter(getPathLength(paths) + (paths.length>1 ? getDistance(paths[paths.length-1], paths[0]) : 0));
        setArea(Math.round(getAreaOfPolygon(paths)));
    }, [paths]);



    function importQuery(){
        if(queryCoords != null){
            try {
                const queryCoordsObj = JSON.parse(atob(queryCoords));
                let arr2 = [];
                for(let i = 0; i<queryCoordsObj.length-1; i++){
                    arr2.push({
                        lat: queryCoordsObj[i].lat,
                        lng: queryCoordsObj[i].lng
                    });
                }
                setPaths(arr2);
            }
            catch (e){
                console.log(e);
            }

        }
    }


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
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    alert("Parcela registada com sucesso.");
                    navigate("/map");
                } else if(xmlhttp.status === 400) {
                    alert("Todos os campos obrigat??rios devem ser preenchidos.");
                } else if(xmlhttp.status === 403 || xmlhttp.status === 404) {
                    alert("N??o tem permiss??es para efetuar esta opera????o.");
                    localStorage.removeItem("token");
                    navigate("/");
                } else if(xmlhttp.status === 409) {
                    alert("J?? possui uma parcela com o mesmo nome.")
                }
                else {
                    alert("Erro do sistema. Tente novamente mais tarde.");
                }
                setRequest(false);
            }
        }

        let url = "https://moonlit-oven-349523.appspot.com/rest/parcel/register";

        f.append('token', localStorage.getItem('token'));
        if(role !== 'D'){
            f.append('owner', document.getElementById("formOwnerName").value);
            url = "https://moonlit-oven-349523.appspot.com/rest/parcel/registerAdmin";
        }
        f.append('name', document.getElementById("formParcelName").value);
        f.append('distrito', document.getElementById("formDistritoDropdown").value);
        f.append('concelho', document.getElementById("formConcelhoDropdown").value);
        f.append('freguesia', document.getElementById("formFreguesiaDropdown").value);
        f.append('photo', file);
        f.append('coordinates', JSON.stringify(paths));
        f.append('document', documentState);
        f.append('usage', document.getElementById("formParcelUsage").value);
        f.append('oldUsage', document.getElementById("formParcelOldUsage").value);
        f.append('cover', document.getElementById("formParcelCover").value);
        f.append('section', document.getElementById("formParcelSection").value);
        f.append('article', document.getElementById("formParcelArticalNum").value);

        for (var pair of f.entries()) {
            console.log(pair[0]+ ', ' + pair[1]);
        }

        console.log(url);
        xmlhttp.open("POST", url, true);
        xmlhttp.send(f);
        setRequest(true);
    }


    return (
        <div className="mapDiv_Map">
            <CSVConverter/><LoadScript
            googleMapsApiKey="AIzaSyC3yXGtu-O5HD8LhlQ18w68dby2HQ2X3O4"
        >

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
                tilt={0}
                onClick={ev => {
                    addMarker(ev.latLng.lat(), ev.latLng.lng())
                }}
                onLoad={() => importQuery()}
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
                            <div className="MapInfo_Map">??rea</div>
                            <div className="MapInfo_Map">{area}m??</div>
                        </div>
                        <br/>
                        <div id="parcelPerimeter">
                            <div className="MapInfo_Map">Per??metro</div>
                            <div className="MapInfo_Map">{perimeter}m</div>
                        </div>
                    </div>
                    <div id="parcelAddPoint">
                        <div id="addLat">
                            <div id="lat_Map" className="MapInfo_Map">Latitude</div>
                            <input className="latlng_input" type="number" id="input_lat" placeholder="Ex: 38.661142" maxLength="64"/>
                        </div>
                        <br/>
                        <div id="addLng">
                            <div id="lng_Map" className="MapInfo_Map">Longitude</div>
                            <input className="latlng_input" type="number" id="input_lng" placeholder="Ex: -9.203510" maxLength="64"/>
                        </div>
                        <button type="button" id="submit_latlng" className="btn btn-success" onClick={() => addMarker(Number(document.getElementById("input_lat").value), Number(document.getElementById("input_lng").value))}>Adicionar ponto</button>
                    </div>
                    <button type="button" id="rollback" className={paths.length > 0 ? "btn btn-success" : "btn btn-secondary"} onClick={rollback}>Voltar atr??s</button>
                </div>


                <div className="submit_Map">
                    <Form onSubmit={submitHandler}>
                        {role === "D"?<></>:<Form.Group className="mt-3" controlId="formOwnerName">
                            <Form.Label> <strong>Nome do Dono</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Nome do Dono" />
                        </Form.Group>}

                        <Form.Group className="mt-3" controlId="formParcelName">
                            <Form.Label> <strong>Nome da Parcela</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Nome da parcela" maxLength="64"/>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formDistritoDropdown">
                            <Form.Label> <strong>Distrito</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Select defaultValue="" className="map_fields" onChange={(e) => handleSetDistrito(e.target.value)}>
                                <option disabled={true} value="">Selecione um distrito</option>
                                {distritoList}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formConcelhoDropdown">
                            <Form.Label> <strong>Concelho</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Select defaultValue="" className="map_fields" onChange={(e) => handleSetConcelho(e.target.value)}>
                                <option disabled={true} value="">Selecione um concelho</option>
                                {concelhoOptions}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formFreguesiaDropdown">
                            <Form.Label> <strong>Freguesia</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Select defaultValue="" className="map_fields">
                                <option disabled={true} value="">Selecione uma freguesia</option>
                                {freguesiaOptions}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelSection">
                            <Form.Label> <strong>Sec????o da Parcela</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Sec????o da Parcela (Ex: SA)" maxLength="2"/>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelArticalNum">
                            <Form.Label> <strong>N?? de Artigo da Parcela</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control className="map_fields" required type="number" placeholder="N?? de Artigo (Ex: 105)" maxLength="3"/>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelCover">
                            <Form.Label> <strong>Cobertura do solo</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control className="map_fields" required type="text" placeholder="Cobertura do solo" maxLength="64"/>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelUsage">
                            <Form.Label> <strong>Utiliza????o do solo</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Select className="map_fields">
                                <option value="Recreacional">Recreacional</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Agricultural">Agricultural</option>
                                <option value="Residencial">Residencial</option>
                                <option value="Comercial">Comercial</option>
                                <option value="Pasto">Pasto</option>
                                <option value="Floresta">Floresta</option>
                                <option value="Privado">Privado</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mt-3" controlId="formParcelOldUsage">
                            <Form.Label> <strong>Utiliza????o pr??via do solo</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Select className="map_fields">
                                <option value="Recreacional">Recreacional</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Agricultural">Agricultural</option>
                                <option value="Residencial">Residencial</option>
                                <option value="Comercial">Comercial</option>
                                <option value="Pasto">Pasto</option>
                                <option value="Floresta">Floresta</option>
                                <option value="Privado">Privado</option>
                            </Form.Select>
                        </Form.Group>


                        <Form.Group className="position-relative mt-3" controlId="formParcelPhoto">
                            <Form.Label> <strong>Foto</strong><span className="red-text">*</span> </Form.Label>
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
                            <Form.Label> <strong>PDF</strong><span className="red-text">*</span> </Form.Label>
                            <Form.Control
                                className="map_fields"
                                type="file"
                                required
                                name="file"
                                accept = ".pdf"
                                onChange={(e) => {setDocument(e.target.files[0]); console.log(e.target.files[0])}}
                            />
                        </Form.Group>

                        <Form.Check
                            className="position-relative mt-3"
                            type="switch"
                            id="custom-switch"
                            label="Importar ficheiro Geojson"
                            onChange={ () => setUseGeoFile(!useGeoFile)}
                        />

                        {useGeoFile ? <Form.Group className="position-relative mt-3" controlId="formParcelPdf">
                            <Form.Label> <strong>Ficheiro Geojson</strong> </Form.Label>
                            <Form.Control
                                className="map_fields"
                                type="file"
                                required
                                name="file"
                                accept = ".geojson"
                                onChange={(e) => {if(e.target.files[0]){loadGeojson(e.target.files[0])}}}
                            />
                        </Form.Group>:<></>}

                        <Button id="submit-button_Map" className="mt-3 mb-3" variant="success" type="submit">
                            {request?<Spinner id="spinne_ConfirmationPage" variant="light" animation="border" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </Spinner>:"Submeter"}
                        </Button>
                    </Form>
                </div>
            </div>


        </div>

    )
}

export default React.memo(Map)