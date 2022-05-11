var map;
function initMap()
{
    map = new google.maps.Map(document.getElementById('map'),
    {
        center: {lat:  38.659784, lng:  -9.202765},
        zoom: 16
    });

    var sala116 = new google.maps.LatLng(38.66104,  -9.2032);
    var marker = new google.maps.Marker({
        position: sala116,
        map: map
    });
}