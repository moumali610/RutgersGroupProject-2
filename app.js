// References to button and inputs 
var searchBtn = document.querySelector("#search");
//var $originInput = document.querySelector("#origin");
var destinationInput = document.getElementById("destination");
var departureInput = document.getElementById("departure");
var table = document.getElementById("myTable")
//var $returnInput = document.querySelector("#return");

// Add event lister to button, call handleSearchButtonClick when clicked
searchBtn.addEventListener("click", handleSearchButtonClick);


// create handleSearchButtonClick function to call api
function handleSearchButtonClick() {

    // create empty lists for fare, duration, and airport
    totalFare = [];
    totalDuration = [];
    nycAirports = [];

    var dataSet = []

    //var filterOrigin = $originInput.value.trim().toLowerCase();
    var filterDestination = destinationInput.value.trim().toLowerCase();
    var filterDeparture = departureInput.value.trim();
    //var filterReturn = $returnInput.value.trim();

    var key = "PHJmVRmr1DGotzz8YPFk92iTGAl3bGIQ";
    var url = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=" + key + "&origin=NYC&destination=" + filterDestination + "&departure_date=" + filterDeparture;
    console.log(url);    

    // create a new request object 
    var request = new XMLHttpRequest();

    // open the request
    request.open("GET", url, true);

    // send request
    request.send();

    // process and read request
    request.onreadystatechange = processRequest;

    // get data if api url is good 
    function processRequest(data) {
        if (request.readyState == 4 && request.status == 200) {
            // parse though response and print json in console
            var response = JSON.parse(request.responseText);
            //console.log(response)
            var results = response.results
            //console.log(results[0].fare.total_price)

            for (var i = 0; i < results.length; i++) {
                var fare = results[i].fare.total_price;

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
                    //dataSet.push(fare)

                    totalDuration.push(minutes)

                    originAirports = []
                    for (var k = 0; k < flights.length; k++) {
                        var origin = flights[k].origin.airport;
                        var departTime = flights[k].departs_at;
                        var arriveTime = flights[k].arrives_at;
                        var markAirline = flights[k].marketing_airline;
                        var opAirline = flights[k].operating_airline;
                        
                        departTime = departTime.replace("T", " ");
                        arriveTime = arriveTime.replace("T", " ");

                        //console.log(origin)
                        originAirports.push(origin);
                        
                        //console.log(dataSet)
                        // console.log(originAirports)
                        //console.log(fare)
                        //console.log("fare: "+fare +"," + "duration: "+duration+","+"origin: "+origin+","+"depart: "+departTime+","+"arrive"+arriveTime+","+"mark: "+markAirline+","+"op: "+opAirline)
                    
                    };
                nycAirports.push(originAirports[0]);
                dataSet.push([opAirline, markAirline, fare, originAirports, duration, departTime, arriveTime]);

                };
            };
        // console.log(totalFare);
        // console.log(totalDuration);
        // console.log(nycAirports);
        // console.log(dataSet)

        // create flight data table
        $(document).ready(function() {
         $("#myTable").DataTable( {
             destroy: true,
             data: dataSet,
             columns : [
                 {title: "Operating Airline"},
                 {title: "Marketing Airline"},
                 {title: "Total Fare ($)"},
                 {title: "Departure Airport"},
                 {title: "Duration (hh:mm)"},
                 {title: "Departing Time"},
                 {title: "Arrival Time"}
             ]
         });
     });

        // create scatterplot with populated list data    
        var flightData = [{
            x: totalDuration,
            y: totalFare,
            hovertext: nycAirports,
            mode: "markers",
            markers: {
                opacity: 0.5,
                size: 20
            },
            selected: {
                marker: {
                    color: "red",
                    size: 30
                }
            },
            type: "scatter"
        }];

        // set up layout for chart
        var flightLayout = {
            title: `<b>Available Flights for ${filterDeparture} to ${filterDestination}</b>`,
            yaxis: {title: "Total One-Way Fare ($)"},
            xaxis: {title: "Duration of Flight (mins)"}
        };

        Plotly.newPlot("chart", flightData, flightLayout)
        }        
    };
};
