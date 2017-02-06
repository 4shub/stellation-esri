const express = require("express");
const app     = express();
const path    = require("path");
const dotenv    = require("dotenv").load();
const bodyParser = require('body-parser')
const stellation = require("../../lib/stellation.js");
const HackMerced_Location = {lat:37.362221, lng:-120.432190}


const env = {
  gasPerMinute:0.05,
  charterBuses:[
    {
      from:"Fresno State",
      location:{
        lat:36.8142552,
        lng:-119.7602178
      }
    },
    {
      from:"UCLA",
      location:{
        lat:34.068921,
        lng:-118.4473698
      }
    },
    {
      from:"UC Berkeley",
      location:{
        lat:37.870231,
        lng:-122.265696
      }
    },
  ],
  airports:[
    {
      from:"Oakland International Airport",
      location:{
        lat:37.7125774,
        lng:-122.219142
      },
      time:130,
      cost:18,
    },
    {
      from:"Los Angeles International Airport",
      location:{
        lat:33.9419093,
        lng:-118.4089377
      },
      time:220,
      cost:128,
    }
  ],
  mercedAirport:{
    lat:37.28862,
    lng:-120.5176457
  }
}

  // nearby
  // place.route({
  //             lat:37.361237,
  //             lng:-120.432163
  //           }, HackMerced_Location, done)
  //
  // // in merced
  // place.route({
  //             lat:37.319207,
  //             lng:-120.478426
  //             }, HackMerced_Location, done)

  // in Fresno (charter override)
  // place.route({
  //             lat:36.729842,
  //             lng:-119.787517
  //             }, HackMerced_Location, done)

  // in Madera (no charter avail)
  // place.route({
  //             lat:36.729842,
  //             lng:-119.787517
  //             }, HackMerced_Location, done)
  //
  // in SF (no charter -> flight)
  // place.route({
  //             lat:37.760300,
  //             lng:-122.419960
  //             }, HackMerced_Location, done)

  // in Oakland (charter)
  // place.route({
  //             lat:37.871298,
  //             lng:-122.265396
  //             }, HackMerced_Location, done)
  //
  // // in Los Angeles (charter)
  // place.route({
  //             lat:34.067712,
  //             lng:-118.449451
  //             }, HackMerced_Location, done)




  // function done(route_map){
  //   console.log(route_map);
  // }



app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/client/index.html'));
});

app.post('/route',function(req,res){

  if(req.body.lat){

    let place = new stellation(process.env.ESRI_USERNAME, process.env.ESRI_PASSWORD, env, function(){

      place.route({
                  lat:req.body.lat,
                  lng:req.body.lng,
                }, HackMerced_Location, function(routeToTake){
                  res.send(routeToTake);
                })
    });


  } else {
    res.send(400);
  }
});


app.listen(40000);
