// References to button and inputs 
var searchBtn = document.querySelector("#search");
//var $originInput = document.querySelector("#origin");
var destinationInput = document.getElementById("destination");
var departureInput = document.getElementById("departure");
//var $returnInput = document.querySelector("#return");

// Add event lister to button, call handleSearchButtonClick when clicked
searchBtn.addEventListener("click", handleSearchButtonClick);


// create handleSearchButtonClick function to call api
function handleSearchButtonClick() {

    // create empty lists for fare, duration, and airport
    totalFare = [];
    totalDuration = [];
    nycAirports = [];

    //var filterOrigin = $originInput.value.trim().toLowerCase();
    var filterDestination = destinationInput.value.trim().toLowerCase();
    var filterDeparture = departureInput.value.trim();
    //var filterReturn = $returnInput.value.trim();

    var key = "PHJmVRmr1DGotzz8YPFk92iTGAl3bGIQ";
    var url = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=" + key + "&origin=NYC&destination=" + filterDestination + "&departure_date=" + filterDeparture;
    //console.log(url);    

    // create a new request object 
    var request = new XMLHttpRequest();

    // open the request
    request.open("GET", url, true);

    // send request
    request.send();

    // process and read request
    request.onreadystatechange = processRequest;

    function processRequest(data) {
        if (request.readyState == 4 && request.status == 200) {
            // parse though response and print json in console
            var response = JSON.parse(request.responseText);
            //console.log(response)
            var results = response.results
            //console.log(results[0].fare.total_price)

            for (var i = 0; i < results.length; i++) {
                var fare = results[i].fare.total_price;
                //totalFare.push(fare);

                var itineraries = results[i].itineraries
                //console.log(itineraries)
                for (var j = 0; j < itineraries.length; j++) {
                    var duration = itineraries[j].outbound.duration

                    // convert hh:mm time to minutes
                    var a = duration.split(":");
                    var minutes = (+a[0] * 60 + (+a[1])) // multiple hh value by 60
                    //console.log(minutes)
                    
                    //console.log("Length of travel: " + duration + " minutes")
                    //console.log("Total fare: $" + fare)

                    var flights = itineraries[j].outbound.flights

                    totalFare.push(fare)
                    totalDuration.push(minutes)
                    
                    originAirports = []
                    for (var k = 0; k < flights.length; k++) {
                        var origin = flights[k].origin.airport
                        //console.log(origin)
                        originAirports.push(origin)
                    // console.log(originAirports)
                    
                    }
                nycAirports.push(originAirports[0]);
                }
            }
        // console.log(totalFare);
        // console.log(totalDuration);
        // console.log(nycAirports);
        }
    };
};
