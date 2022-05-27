import React from 'react'
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Marker } from '@react-google-maps/api';
import { useState } from 'react'
import { Polygon } from '@react-google-maps/api';

const containerStyle = {
    width: 'auto',
    height: 'auto'
};

const center = {
    lat: -35.745,
    lng: -38.523
};


const NewMap = () => {
    const [markerList, setMarker] = useState([]);
    const [paths, setPaths] = useState([]);

    function addMarker(lat, lng) {
        console.log(lat, lng)

        setMarker(markerList.concat(<Marker key={markerList.length} id={markerList.length} position={{
            lat: lat,
            lng: lng
        }} />))
    

        setPaths(paths.concat({
            lat: lat,
            lng: lng
        }))

        console.log("Lista:")

        for (let i = 0; i < markerList.length; i++) {
            console.log(markerList[i])
        }

        console.log("paths")
        console.log(paths)
    }

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

    return (
        <LoadScript
            googleMapsApiKey="AIzaSyAzmUVpLtuvY1vhrHL_-rcDyk_krHMdSjQ"
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={5}
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
    )
}

export default React.memo(NewMap)