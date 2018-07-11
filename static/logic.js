// Create a map object
var myMap = L.map("map", {
  center: [37.09, 0],
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

// Function that will determine the color of a neighborhood based on the borough it belongs to
function chooseColor(arrivals) {
  if (arrivals == '') {return ""}
  else if (arrivals <1000000) {return "#c7ff44"}
  else if (arrivals < 10000000 ) {return "#13d77b"}
  else if (arrivals < 20000000 ) {return "#00a698"}
  else if (arrivals < 50000000 ) {return "#00718d"}
  else {return "#003f5c"}
};


var geodata = "/countries.geojson";
// Grabbing our GeoJSON data..
d3.json(geodata, function(data) {
  // Creating a geoJSON layer with the retrieved data
  L.geoJson(data, {
    // Style each feature (in this case a neighborhood)
    style: function(feature) {
      return {
        color: "white",
        // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)
        fillColor: chooseColor(feature.properties.SNT_INT_ARVL),
        fillOpacity: 0.5,
        weight: 1.5
      };
    },
    // Called on each feature
    onEachFeature: function(feature, layer) {
      // Giving each feature a pop-up with information pertinent to it
      layer.bindPopup(feature.properties.ADMIN +"<br># Arrivals: "+ (feature.properties.SNT_INT_ARVL / 1000000)+" million");

    }
  }).addTo(myMap);
});

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1,1000000, 10000000, 20000000 , 50000000],
        labels = [0,1,10,20,50];

    div.innerHTML = "in Millions <br>"
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i]) + '"></i> ' +
            labels[i] + (labels[i + 1] ? '&ndash;' + labels[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);