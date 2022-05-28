import React from 'react'
import {GoogleMap, LoadScript} from '@react-google-maps/api';
import {Marker} from '@react-google-maps/api';
import {useState} from 'react'
import {Polygon} from '@react-google-maps/api';
import "./Map.css"

const containerStyle = {
    width: '80vw',
    height: '93vh'
};

const center = {
    lat: 38.660677,
    lng: -9.205971
};

const options = {
    fillColor: "lightblue",
    fillOpacity: 0.5,
    strokeColor: "blue",
    strokeOpacity: 1,
    strokeWeight: 2,
    clickable: false,
    draggable: false,
    editable: false,
    geodesic: false,
    zIndex: 1
}


const Map = () => {
    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);

    function addMarker(lat, lng) {

        setMarker(markerList.concat(<Marker key={markerList.length} id={markerList.length} position={{
            lat: lat,
            lng: lng
        }}/>))


        setPaths(paths.concat({
            lat: lat,
            lng: lng
        }))
    }

    function rollback() {
        setMarker(markerList.filter((element, index) => index < markerList.length -1));
        setPaths(paths.filter((element, index) => index < paths.length -1));
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
            <button onClick={rollback}>Rollback</button></div>

    )
}

export default React.memo(Map)