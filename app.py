# import necessary libraries
from sqlalchemy import func
import pymongo
#from flask_pymongo import PyMongo
from bson.json_util import dumps, loads
import numpy as np
import pandas as pd
import json
import os
import requests
from keys import key, mongokey #uncomment if you are running locally

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)


#################################################
# Flask Setup
#################################################

app = Flask(__name__)
#mongokey = os.environ.get("mongokey")  #comment out if you're running locally
#key = os.environ.get("key")  #comment out if you're running locally
#################################################
# Database Setup
#################################################

# conn = "mongodb+srv://" + mongokey + "@cluster0-lqw3j.mongodb.net/test?retryWrites=true"
# #pip install dnspython needed to connect to mongodb server online
# client = pymongo.MongoClient(conn)

# db = client.travel
# collection = db.airports

#################################################
# Flask Routes
#################################################

@app.route('/countries.geojson')
def countries():

    json_data = open(os.path.join(os.path.dirname( __file__ ),"data", "countries_data.geojson"), "r")
    
    data = json.load(json_data)
    return jsonify(data)

# Query the database for names and send the jsonified results
@app.route('/airports')
def airports():
    airports = list(collection.find())
    print(airports)
    airports_df = pd.DataFrame(airports)
    #return dumps({'cursor': airports})
    airports_df = airports_df.drop(columns="_id")
    airports_df = airports_df.fillna(value="")
    return jsonify(airports_df.to_dict(orient="records"))
    
# create route that renders airport.html template
@app.route("/NYCairports")
def NYCairports():
    return render_template("airport.html", key=key)


# create route that renders bio.html template
@app.route("/Team")
def Team():
    return render_template("bio.html", key=key)


# create route that renders flights.html template
@app.route("/flights")
def flight():
    return render_template("flights.html", key=key)

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/amadeus/<orig>/<dept_date>")
def getAmadeus(orig, dept_date):
    url = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=" + key + "&origin=" + orig + "&destination=NYC&departure_date=" + dept_date

    results = requests.get(url)

    return jsonify(results.json())

if __name__ == "__main__":
    app.run(debug=True)
