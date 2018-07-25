// References to button and inputs 
var searchBtn = document.querySelector("#search");
var originInput = document.querySelector("#origin");
var departureInput = document.getElementById("departure");
var nonstopInput = document.getElementById("nonstop")
var table = document.getElementById("myTable")

// Add event lister to button, call handleSearchButtonClick when clicked
searchBtn.addEventListener("click", handleSearchButtonClick);

// create handleSearchButtonClick function to call api
function handleSearchButtonClick() {

    // create chartData array for chart
    var chartData = []
    // create dataSet array for flight data table
    var dataSet = [];

    // remove whitespace and lowercase input 
    var filterOrigin = originInput.value.trim().toLowerCase();
    var filterDeparture = departureInput.value.trim();

    
    var url = "/amadeus/" + filterOrigin + "/" + filterDeparture;
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
                    destinationAirports = []
                    departTimes = []
                    for (var k = 0; k < flights.length; k++) {
                        var origin = flights[k].origin.airport;
                        var destination = flights[k].destination.airport;
                        var departTime = flights[k].departs_at;
                        var arriveTime = flights[k].arrives_at;
                        var opAirline = flights[k].operating_airline;
                        
                        //console.log(departTime)
                        var dt = new Date(departTime)
                        var at = new Date(arriveTime)

                        // convert departure datetime string to time format
                        var depart = moment(departTime).format("HH:mm")
                        //console.log(depart)
                        //console.log(origin)

                        originAirports.push(origin);
                        destinationAirports.push(destination)
                        departTimes.push(depart);
                        
                        //console.log(destinationAirports)
                        //console.log(fare)
                        //console.log("fare: "+fare +"," + "duration: "+duration+","+"origin: "+origin+","+"depart: "+departTime+","+"arrive"+arriveTime+","+"mark: "+markAirline+","+"op: "+opAirline)
                    
                    };
                // push data to empty lists    
                chartData.push({"fare": fare, "depart_time": departTimes[0], "airport": destinationAirports[destinationAirports.length - 1]});
                dataSet.push([opAirline, fare, originAirports, destinationAirports.slice(-1), duration, dt, at]);
                
                // console.log(destinationAirports)
                // console.log(destinationAirports.slice(-1))
                };
            };

        // console.log(dataSet)
        // console.log(chartData)

        // sort chartData by time
        chartData.sort(function(a, b) {
            return new Date('1970/01/01 ' + a.depart_time) - new Date('1970/01/01 ' + b.depart_time);
        });
        
        // set up traces for chart
        let traces = [];
        let data = [];

        for (let i = 0; i < chartData.length; i += 1) {
            if (data.indexOf(chartData[i].airport) === -1) {
                traces.push({x: [],
                        y: [],
                        mode: 'markers',
                        name: chartData[i].airport
                        });
                data.push(chartData[i].airport);
            } else {
                traces[data.indexOf(chartData[i].airport)].x.push(chartData[i].depart_time);
                traces[data.indexOf(chartData[i].airport)].y.push(chartData[i].fare);
            }
        };
        
        // set up layout for chart
        var input = filterOrigin.toUpperCase()

        var flightLayout = {
            title: `<b>Available Flights for ${filterDeparture} from ${input}</b>`,
            yaxis: {title: "Total One-Way Fare ($)"},
            xaxis: {title: "Time of Departure to NYC"}
        };

        Plotly.newPlot("chart", traces, flightLayout);

        // set up data for bar chart
        var airportFare = d3.nest()
        .key(function(d) { return d.airport; })
        .sortKeys(d3.ascending)
        .rollup(function(v) {return d3.median(v, function(d) { return d.fare;}); })
        .entries(chartData)
    
        //console.log(airportFare);
        
        var airportNames = []
        var medFare = []
        
        for (var i = 0; i < airportFare.length; i++) {
            airportNames.push(airportFare[i].key);
            medFare.push(airportFare[i].value);
        }
        
        //console.log(airportNames)
        //console.log(medFare)
        
        var barData = [{
            x: airportNames,
            y: medFare,
            type: "bar",
            text: medFare,
            textposition: "auto",
            hoverinfo: "none",
            marker: {
                color: ["#EDA96A", "#E35B5B", "#B18686", "#F0A909"],
                opacity: 0.6
            }
        }]
        
        var barLayout = {
            title: "Average Prices for Each Airport",
            xaxis: {title: "Arrival Airport"},
            yaxis: {title: "Prices ($)"}
        }
        
        Plotly.newPlot("bar", barData, barLayout)

        // create flight data table
        $(document).ready(function() {
         $("#myTable").DataTable( {
             destroy: true,
             data: dataSet,
             columns: [
                {title: "Operating Airline"},
                {title: "Total Fare ($)"},
                {title: "Departure Airport"},
                {title: "Destination Airport"},
                {title: "Duration (hh:mm)"},
                {title: "Departing Time"},
                {title: "Arrival Time"}
               ]
            });
        });
     
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