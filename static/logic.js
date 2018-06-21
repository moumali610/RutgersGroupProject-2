// Create a map object
var myMap = L.map("map", {
  center: [37.09, -20.71],
  zoom: 2
});

// Add a tile layer to the map
L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiY2VzMjcxIiwiYSI6ImNqZWc0N2Z5OTFvc2IzOW83Mzd3MGQ0dnMifQ.JRh9OvYI46C4wssFMMeETg"
).addTo(myMap);

var url = "/airports"

d3.json(url, function(response){
    
    var markers = L.markerClusterGroup();

    for (var i = 0; i < response.length; i++) {

    var location = response[i].lat;
    

    if (location) {
      markers.addLayer(L.marker([response[i].lat,response[i].long])
        .bindPopup("IATI Code: " + response[i]._iati_code+ "<br>Name: " + response[i]._name+ "<br>Location: "+response[i].city_name+", "+ response[i].country));
    }
  }
myMap.addLayer(markers);
});
