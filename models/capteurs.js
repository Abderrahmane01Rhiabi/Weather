const mongoose = require('mongoose'); 

var capteurSchema = new mongoose.Schema({
    name : {type : String, required: true},
    place : {type : String },
    macAddr : {type : String ,requrie :true}
})

var capteur = mongoose.model("capteur",capteurSchema);
module.exports = capteur;