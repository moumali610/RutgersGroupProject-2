// Create a map object
var myMap = L.map("map", {
  center: [40.80 , -74.00],
  zoom: 10
});

// Add a tile layer to the map
L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoiY2VzMjcxIiwiYSI6ImNqZWc0N2Z5OTFvc2IzOW83Mzd3MGQ0dnMifQ.JRh9OvYI46C4wssFMMeETg"
).addTo(myMap);

// Define a markerSize function that will give each airport a different radius based on its population
function markerSize(population) {
  return population / 60;
}

var url = "/airports"

d3.json(url, function(response){

    for (var i = 0; i < response.length; i++) {
    
      if (location) {
        L.circle([response[i].lat_dd,response[i].long_dd], {
          fillOpacity: 0.50,
          color: "#808080",
          fillColor: "#ffdbb2",
          // Setting our circle's radius equal to the output of our markerSize function
          // This will make our marker's size proportionate to its population
          radius: markerSize(response[i].total_operations)
          }).bindPopup("IATI Code: " + response[i].loc_id+ 
          "<br>Name: " + response[i].airport_name+ 
          "<br>Location: "+ response[i].associated_city+", "+ response[i].state + 
          "<br>NPIAS Type: " + response[i].npias_service_level +"/"+response[i].npias_hub_type +
          "<br>Total Operations(annual # of departures and arrivals): "+response[i].total_operations
        ).addTo(myMap);

          L.circle([response[i].lat_dd,response[i].long_dd], {
            fillOpacity: 1,
            color: "black",

            // Setting our circle's radius equal to the output of our markerSize function
            // This will make our marker's size proportionate to its population
            radius: 10
            }).addTo(myMap);

        }
}});


