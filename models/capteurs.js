const mongoose = require('mongoose'); 

var capteurSchema = new mongoose.Schema({
    _macAddr : {type : mongoose.Schema.Types.Number ,required :true ,unique : true},
    name : {type : String, required: true},
    place : {type : String }
})

capteurSchema.pre('save',  function(next) {
});

var capteur = mongoose.model("capteur",capteurSchema);
module.exports = capteur;