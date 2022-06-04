import React from 'react'
import {GoogleMap, LoadScript} from '@react-google-maps/api';
import {Marker} from '@react-google-maps/api';
import {useState} from 'react'
import {Polygon} from '@react-google-maps/api';
import "./Map.css"

const google = window.google;

const containerStyle = {
    width: '70vw',
    height: '93vh'
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
    let xmlhttp = new XMLHttpRequest();
    let token = sessionStorage.getItem('token');

    function submitParcel() {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    token = xmlhttp.responseText;
                    alert("Login efetuado com sucesso.");
                    sessionStorage.setItem('token', token);
                    window.location.href = "/homepage";
                } else {
                    alert("Não foi possível efetuar o login.");
                }
            }
        }
        let myObj = {
            coordinates: []
        };

        for (let i = 0; i < paths.length; i++) {
            myObj.coordinates.push([paths[i].lat, paths[i].lng]);
        }

        let myJson = JSON.stringify(myObj);

        console.log(myJson);

        /*xmlhttp.open("POST", "https://modified-talon-344017.oa.r.appspot.com/rest/login/" + document.getElementById("session-username").value, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(myJson);*/
    }

    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);

    function addMarker(lat, lng) {

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
        }))
    }

    function rollback() {
        setMarker(markerList.filter((element, index) => index < markerList.length - 1));
        setPaths(paths.filter((element, index) => index < paths.length - 1));
    }


    return (
        <div className="mapDiv_Map"><LoadScript
            googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={10}
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
            <button type="button" className="btn btn-light" onClick={rollback}>Rollback</button>
            <button type="button" className={paths.length >= 3 ? "btn btn-success" : "btn btn-secondary"}
                    onClick={submitParcel}>Submit
            </button>
            <input type="text" className="form-control" placeholder="Parcel name"/>
        </div>


    )
}

export default React.memo(Map)