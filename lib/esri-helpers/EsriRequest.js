/**
* Dependencies
*/
const request = require('request');
const base_uri = "https://www.arcgis.com/sharing/rest/";

/*
* checkNeeds objects are formatted like the body, but without actual values
  needs = {
    dog:true,
    cat:{
      meme:true
    }
  }
*/

function checkNeeds(body, needs){

  for(let i in needs){

    if(typeof needs[i] === "boolean"){
      if(!body[i]){
        return false;
      }
    } else {
      checkNeeds(body, needs[i]); // it's an object else, and we need to explore that too
    }
  }
  return true;
}

function esri_request(options, needs, resolve, reject){
  if(!options.headers){ options.headers = {}; }
  if(options.endpoint){ options.uri = base_uri + options.endpoint }
  if(!options.qs){ options.qs = {} };
      options.qs.f = "json";
      options.json = true;

  request(options,
          function(error, response, body){
            if(body && checkNeeds(body, needs)){
              resolve(body, response);
              return;
            }

            reject(error, response);
            return;
          });
}


module.exports = esri_request;
