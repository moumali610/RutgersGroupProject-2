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
        faa_site_number = db.Column(db.String, primary_key=True)
        loc_id = db.Column(db.String)
        airport_name = db.Column(db.String)
        associated_city = db.Column(db.String)
        state = db.Column(db.String)
        region = db.Column(db.String)
        ado = db.Column(db.String)
        use = db.Column(db.String)
        lat_dms = db.Column(db.String)
        long_dms = db.Column(db.String)
        lat_dd = db.Column(db.Float)
        long_dd = db.Column(db.Float)
        airport_ownership = db.Column(db.String)
        part_139 = db.Column(db.String)
        npias_service_level = db.Column(db.String)
        npias_hub_type = db.Column(db.String)
        airport_control_tower = db.Column(db.String)
        fuel = db.Column(db.String)
        other_services = db.Column(db.String)
        based_aircraft_total = db.Column(db.Integer)
        total_operations = db.Column(db.Integer)

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

    sel = [
        Airports.faa_site_number,
        Airports.loc_id,
        Airports.airport_name,
        Airports.associated_city,
        Airports.state,
        Airports.region,
        Airports.ado,
        Airports.use,
        Airports.lat_dms,
        Airports.long_dms,
        Airports.lat_dd,
        Airports.long_dd,
        Airports.airport_ownership,
        Airports.part_139,
        Airports.npias_service_level,
        Airports.npias_hub_type,
        Airports.airport_control_tower,
        Airports.fuel,
        Airports.other_services,
        Airports.based_aircraft_total,
        Airports.total_operations
        ]
    
    results = db.session.query(*sel).all()
    df = pd.DataFrame(results, columns=['faa_site_number', 'loc_id', 'airport_name', 'associated_city', 'state', 'region', 'ado', 'use', 'lat_dms', 'long_dms', 'lat_dd', 'long_dd', 'airport_ownership', 'part_139', 'npias_service_level', 'npias_hub_type', 'airport_control_tower', 'fuel', 'other_services', 'based_aircraft_total', 'total_operations'])
    
    
    return jsonify(df.to_dict(orient="records"))

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




