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
  constructor(esri_username, esri_password, env, resolve){
    this.env = env;
    this.user = new EsriUser(esri_username, esri_password);
    this.user.generateKey(function(error, res){
      resolve();
    }, function(error, res){

    });


  }

  writeTextDirection(text){
    this.route_plan.text_directions = text;
  }


  getValuation(distance, time, costpertime){
    return time*costpertime/distance;
  }

  findClosestCoords(start, endArr){
    let nearest = endArr[0];
        nearest.distance = this.distance(start, endArr[0].location);

    for(let i in endArr){
      let newDistance = this.distance(start, endArr[i].location);
      if(nearest.distance > newDistance){
        nearest = endArr[i];
        nearest.distance = newDistance;

      }
    }

    console.log("4C")



    return nearest;
  }

  findBestCluster(clusters){
    let bestCluster = clusters[0]

    for(let i in clusters){
      if(clusters[i].value < bestCluster.value){
        bestCluster = clusters[i];
      }
    }

    return bestCluster;

  }

  // returns the data we need to find the route between two places
  route(start, end, resolve){
    // find initial distance between the two objects
    const intial_distance = this.distance(start, end);
    let that = this;

    that.route_plan = {
        direct_distance: intial_distance
    }

    if(intial_distance < 1){
      this.writeTextDirection("You are already at your destination!");
      this.route_plan.route_value = 0;
      this.route_plan.total_distance = 0;
      this.route_plan.stops = 0;

      resolve(that.route_plan)
      return;
    } else {
      let routeCluster = [];
      this.writeTextDirection("Follow this route by car until your destination.");


      this.makeRoute(start, end, function(route_attr){
        let driving_cost = that.env.gasPerMinute*route_attr.attributes.Total_TravelTime;
        routeCluster.push({
          directions: { driving: {route:route_attr.geometry.paths[0], cost: driving_cost } },
          total_distance: route_attr.attributes.Total_Kilometers,
          travel_time: route_attr.attributes.Total_TravelTime,
          total_cost: driving_cost,
          type:"driving",
          value: that.getValuation(route_attr.attributes.Total_TravelTime, route_attr.attributes.Total_Kilometers, that.env.gasPerMinute)
        });


        // find nearest charter
        let nearest_bus = that.findClosestCoords(start, that.env.charterBuses);

        if(that.distance(start, nearest_bus.location) < 30){
          that.makeRoute(start, nearest_bus.location, function(route_attr){
            that.makeRoute(nearest_bus.location, end, function(route_attr_2){
              let driving_cost = that.env.gasPerMinute*route_attr.attributes.Total_TravelTime;

              routeCluster.push({
                directions: {
                  driving: {
                    route:route_attr.geometry.paths[0], cost: driving_cost
                  },
                  bus:{
                    route:route_attr_2.geometry.paths[0], cost: 0,
                    startsAt: nearest_bus.from
                  }
                },
                total_distance: route_attr.attributes.Total_Kilometers + route_attr_2.attributes.Total_Kilometers,
                travel_time: route_attr.attributes.Total_TravelTime + route_attr_2.attributes.Total_TravelTime,
                total_cost: driving_cost,
                type:"bus",
                value: that.getValuation(route_attr.attributes.Total_TravelTime, route_attr.attributes.Total_Kilometers, that.env.gasPerMinute)
              });

              findAirport();
            });
          });
        } else {
          findAirport();
        }
        // find nearest viable airport
        function findAirport(){
          let nearest_airport = that.findClosestCoords(start, that.env.airports);




          that.makeRoute(start, nearest_airport.location, function(route_attr){
            that.makeRoute(that.env.mercedAirport, end, function(route_attr_2){

              let driving_cost = that.env.gasPerMinute*route_attr.attributes.Total_TravelTime;
              let flightDistance = that.distance(nearest_airport.location, that.env.mercedAirport);
              routeCluster.push({
                directions: {
                  driving: {
                    route:route_attr.geometry.paths[0], cost: driving_cost
                  },
                  flying:{
                    route:[[nearest_airport.location.lng, nearest_airport.location.lat], [that.env.mercedAirport.lng, that.env.mercedAirport.lat]], cost: 0,
                    startsAt: nearest_airport.from
                  },
                  shuttle:{
                    route:route_attr_2.geometry.paths[0], cost: 0,
                    startsAt: "Merced Airport"
                  }
                },
                total_distance: route_attr.attributes.Total_Kilometers + flightDistance,
                travel_time: route_attr.attributes.Total_TravelTime + route_attr.attributes.Total_TravelTime_2 + nearest_airport.time,
                total_cost: driving_cost + nearest_airport.cost,
                type:"flying",
                value: that.getValuation(route_attr.attributes.Total_TravelTime, route_attr.attributes.Total_Kilometers, that.env.gasPerMinute)
              });


              resolve(that.findBestCluster(routeCluster));
            });
          });

        }


      });

      return;
    }
  }

  distance(start, end){
    function toRad(Value) {
      return Value * Math.PI / 180;
    }

    const R = 6371; // km
    let dLat = toRad(end.lat-start.lat);
    let dLon = toRad(end.lng-start.lng);
    let lat1 = toRad(start.lat);
    let lat2 = toRad(end.lat);

    let a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    let d = R * c;

    return d;
  }

  // finds the distance between two points
  makeRoute(start, end, resolve, reject){
    EsriRequest({
      uri:"https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve",
      qs:{
        stops:`${start.lng},${start.lat};${end.lng},${end.lat}`,
        token: this.user.token,
      }
    },
    {
      routes:{
        features:[
          {
            geometry:{
              paths:true
            }
          }
        ]
      }
    },
    function(body, res){
        resolve(body.routes.features[0]);
    },
    reject)
  }


}

module.exports = Stellation;
