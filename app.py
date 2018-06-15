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
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///travel.sqlite"

db = SQLAlchemy(app)

class Airports(db.Model):
    __tablename__ = 'airports'

    otu_id = db.Column(db.Integer, primary_key=True)
    lowest_taxonomic_unit_found = db.Column(db.String)

    def __repr__(self):
        return '<Emoji %r>' % (self.name)

class Metadata(db.Model):
    __tablename__ = 'samples_metadata'
    
    SAMPLEID =db.Column(db.Integer, primary_key=True)
    EVENT = db.Column(db.String)
    ETHNICITY = db.Column(db.String)
    GENDER = db.Column(db.String)
    AGE = db.Column(db.Integer)
    WFREQ = db.Column(db.Integer) 
    BBTYPE = db.Column(db.String) 
    LOCATION = db.Column(db.String)
    COUNTRY012 = db.Column(db.String) 
    ZIP012 = db.Column(db.Integer) 
    COUNTRY1319 = db.Column(db.String) 
    ZIP1319 = db.Column(db.Integer) 
    DOG = db.Column(db.String) 
    CAT = db.Column(db.String) 
    IMPSURFACE013 = db.Column(db.Integer) 
    NPP013 = db.Column(db.Float) 
    MMAXTEMP013 = db.Column(db.Float)
    PFC013 = db.Column(db.Float)
    IMPSURFACE1319 = db.Column(db.Integer) 
    NPP1319 = db.Column(db.Float)
    MMAXTEMP1319 = db.Column(db.Float) 
    PFC1319 = db.Column(db.Float)

    def __repr__(self):
        return '<Emoji %r>' % (self.name)

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
@app.route("/names")
def names():
    results = db.session.query(Metadata.SAMPLEID).all()
    df = pd.DataFrame(results, columns=['otu_id'])
    df['otu_id'] = 'BB_' + df['otu_id'].astype(str)

    return jsonify(df['otu_id'].tolist())

# Query the database for OTU description and send the jsonified results
@app.route("/otu")
def otu():
    results = db.session.query(Otu.lowest_taxonomic_unit_found).all()
    df = pd.DataFrame(results, columns=['lowest_taxonomic_unit_found'])

    return jsonify(df['lowest_taxonomic_unit_found'].tolist())

@app.route('/metadata/<sample>')
def metadatasample(sample):
    
    s = sample.split('_')[1]

    #Args: Sample in the format: `BB_940`

    sel = [Metadata.AGE, Metadata.BBTYPE, Metadata.ETHNICITY, Metadata.GENDER, Metadata.LOCATION, Metadata.SAMPLEID]
    
    results = db.session.query(*sel).filter(Metadata.SAMPLEID == s).all()
    df = pd.DataFrame(results, columns=['AGE', 'BBTYPE','ETHNICITY','GENDER','LOCATION','SAMPLEID'])
    
    return jsonify(df.to_dict(orient="records"))

@app.route('/wfreq/<sample>')
def wfreq(sample):
    s = sample.split('_')[1]
    
    sel = [Metadata.WFREQ]
    
    results = db.session.query(*sel).filter(Metadata.SAMPLEID == s).all()
    
    
    return jsonify(results[0][0])

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)


