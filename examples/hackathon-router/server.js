const express = require("express");
const app     = express();
const path    = require("path");
const dotenv    = require("dotenv");
const stellation = require("../lib/stellation.js");


let route = new stellation(process.env.ESRI_USERNAME, process.env.ESRI_PASSWORD)

//
// app.get('/',function(req,res){
//   res.sendFile(path.join(__dirname+'/client/index.html'));
// });
//
// app.get('/route',function(req,res){
//   if(req.body.start && req.body.end){
//
//   } else {
//     res.send(400);
//   }
// });
//
//
// app.listen(40000);
