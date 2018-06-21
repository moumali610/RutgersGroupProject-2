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
    nycAirports = [];
    nycDepartTimes = [];

    // create chartData array for chart
    var chartData = []
    // create dataSet array for flight data table
    var dataSet = [];

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
                    
                    //console.log("Length of travel: " + duration + " minutes")
                    //console.log("Total fare: $" + fare)
                    var flights = itineraries[j].outbound.flights

                    //totalFare.push(fare)
                    //dataSet.push(fare)

                    // get all data for origin airports and departure times
                    originAirports = []
                    departTimes = []
                    for (var k = 0; k < flights.length; k++) {
                        var origin = flights[k].origin.airport;
                        var departTime = flights[k].departs_at;
                        var arriveTime = flights[k].arrives_at;
                        var markAirline = flights[k].marketing_airline;
                        var opAirline = flights[k].operating_airline;
                        
                        //console.log(departTime)
                        var dt = new Date(departTime)
                        var at = new Date(arriveTime)

                        // convert departure datetime string to time format
                        var depart = moment(departTime).format("HH:mm")
                        //console.log(depart)
                        //console.log(origin)

                        originAirports.push(origin);
                        departTimes.push(depart);
                        
                        // console.log(originAirports)
                        //console.log(fare)
                        //console.log("fare: "+fare +"," + "duration: "+duration+","+"origin: "+origin+","+"depart: "+departTime+","+"arrive"+arriveTime+","+"mark: "+markAirline+","+"op: "+opAirline)
                    
                    };
                // push data to empty lists    
                nycAirports.push(originAirports[0]);
                //nycDepartTimes.push(departTimes[0]);
                chartData.push({"fare": fare, "depart_time": departTimes[0]});
                dataSet.push([opAirline, markAirline, fare, originAirports, duration, dt, at]);
                
                };
            };
        // console.log(totalFare);
        // console.log(nycAirports);
        // console.log(nycDepartTimes)
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

        // sort chartData by time
        chartData.sort(function(a, b) {
            return new Date('1970/01/01 ' + a.depart_time) - new Date('1970/01/01 ' + b.depart_time);
        });
        
        for (var i = 0; i < chartData.length; i++) {
            totalFare.push(chartData[i].fare);
            nycDepartTimes.push(chartData[i].depart_time);
        };

        // console.log(totalFare);
        // console.log(nycDepartTimes);

        // create scatterplot with populated list data    
        var flightData = [{
            x:  nycDepartTimes,
            y: totalFare,
            hovertext: nycAirports,
            mode: "markers",
            type: "scatter"
        }];

        // set up layout for chart
        var flightLayout = {
            title: `<b>Available Flights for ${filterDeparture} to ${filterDestination}</b>`,
            yaxis: {title: "Total One-Way Fare ($)"},
            xaxis: {title: "Time of Departure from NYC"}
        };

        Plotly.newPlot("chart", flightData, flightLayout)
        };       
    };
};

//////////////////////////////////////////////////////////////////////////////////////

// display current time and date on page
function startTime() {
    var today = new Date();
    var hr = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();
    ap = (hr < 12) ? "<span>AM</span>" : "<span>PM</span>";
    hr = (hr == 0) ? 12 : hr;
    hr = (hr > 12) ? hr - 12 : hr;
    //Add a zero in front of numbers<10
    hr = checkTime(hr);
    min = checkTime(min);
    sec = checkTime(sec);
    document.getElementById("clock").innerHTML = hr + ":" + min + ":" + sec + " " + ap;
    
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var curWeekDay = days[today.getDay()];
    var curDay = today.getDate();
    var curMonth = months[today.getMonth()];
    var curYear = today.getFullYear();
    var date = curWeekDay + ", " + curDay + " " + curMonth + " " + curYear;
    document.getElementById("date").innerHTML = date;
    
    var time = setTimeout(function(){ startTime() }, 500);
};

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
};
