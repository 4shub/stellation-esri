const EsriRequest = require('./EsriRequest.js');

// Esri User is a class meant to store and load keys from the esri account information provided
class EsriUser{
  // creates a user for the esri connection
  constructor(esri_username, esri_password, reject){
    this.username = esri_username;
    this.password = esri_password;
  }

  // generates server api token for esri
  generateKey(reject){
    EsriRequest({
      method: 'POST',
      endpoint:"generateToken",
      qs:{
        username:this.username,
        password:this.password,
        expiration:1,
        referer:"HackMerced"
      }
    },
    { token: true },
    function(body, res){
      this.token = body.token;
    },
    function(error, res){
      reject({error:error, type:"RequestError"});
    })
  }
}


module.exports = EsriUser;
