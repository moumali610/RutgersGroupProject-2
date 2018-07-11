# import necessary libraries
from sqlalchemy import func
import numpy as np
import pandas as pd
import json
import os
import requests
from keys import key 

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

#################################################
# Database Setup
#################################################
from flask_sqlalchemy import SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data/travel.sqlite"

db = SQLAlchemy(app)

class Airports(db.Model):
    __tablename__ = 'airports'

    id = db.Column(db.Integer, primary_key=True)
    iati_code = db.Column(db.String)
    name = db.Column(db.String)
    city_code = db.Column(db.String)
    city_name = db.Column(db.String)
    country_code = db.Column(db.String)
    country = db.Column(db.String)
    lat = db.Column(db.Float)
    long = db.Column(db.Float)

    def __repr__(self):
        return '<Airports %r>' % self.name

# Create database classes
@app.before_first_request
def setup():
    # Recreate database each time for demo
    # db.drop_all()
    db.create_all()

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
def airport():

    sel = [Airports.iati_code, Airports.name, Airports.city_code,Airports.city_name, Airports.country, Airports.lat, Airports.long]
    
    results = db.session.query(*sel).all()
    df = pd.DataFrame(results, columns=['_iati_code', '_name','city_code','city_name','country','lat','long'])
    
    
    return jsonify(df.to_dict(orient="records"))

# create route that renders airports.html template
@app.route("/map")
def map():
    return render_template("airports.html")

# create route that renders flights.html template
@app.route("/flights")
def flight():
    return render_template("flights.html", key=key)

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/amadeus/<dest>/<dept_date>")
def getAmadeus(dest, dept_date):
    url = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search?apikey=" + key + "&origin=NYC&destination=" + dest + "&departure_date=" + dept_date

    results = requests.get(url)

    return jsonify(results.json())

if __name__ == "__main__":
    app.run(debug=True)




