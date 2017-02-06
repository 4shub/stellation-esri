const EsriRequest = require('./EsriRequest.js');

// Esri User is a class meant to store and load keys from the esri account information provided
class EsriUser{
  // creates a user for the esri connection
  constructor(esri_username, esri_password, reject){
    this.username = esri_username;
    this.password = esri_password;
  }

  // generates server api token for esri
  generateKey(resolve, reject){
    let that = this;

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
      that.token = body.token;

      resolve();
    },
    function(error, res){
      reject({error:error, body:res.body, type:"RequestError"}, res);
    })
  }
}


module.exports = EsriUser;
