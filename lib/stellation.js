'use strict'

/**
* Dependencies
*/

const pkg = require('../package.json');
const request = require('request');
const EsriUser = require('./esri-helpers/EsriUser.js');
const EsriRequest = require('./esri-helpers/EsriRequest.js');

// define stellation
class Stellation{
  constructor(esri_username, esri_password){
    this.user = new EsriUser(esri_username, esri_password);
  }

  // returns the data we need to find the route between two places
  route(start, end){
    
  }

  // finds the distance between two points
  distance(start, end){

  }


}

module.exports = Stellation;
