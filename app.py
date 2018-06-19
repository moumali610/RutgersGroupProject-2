# import necessary libraries
from sqlalchemy import func
import numpy as np
import pandas as pd
import json

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

# Query the database for names and send the jsonified results
@app.route('/airports')
def airport():

    sel = [Airports.iati_code, Airports.name, Airports.city_code,Airports.city_name, Airports.country_code, Airports.country, Airports.lat, Airports.long]
    
    results = db.session.query(*sel).all()
    df = pd.DataFrame(results, columns=['iati_code', 'name','city_code','city_name','country_code','country','lat','long'])
    
    query_dict = df.to_dict(orient="records")
    airport_dict = []

    for item in query_dict:
        i = {'label': '(' + item['iati_code'] + ') ' + item['name'] ,'category': str(item['city_name']) + ', ' + str(item['country'])}
        airport_dict.append(i)
    
    return jsonify(airport_dict)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)


