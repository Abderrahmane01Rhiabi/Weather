const mongoose = require('mongoose'); 

var capteurSchema = new mongoose.Schema({
    macAddr : {type : String, required : true ,unique : true},
    name : {type : String, required : true},
    place_x : {type : String, required : true },
    place_y : {type : String, required : true }
})

capteurSchema.pre('save',  function(next) {
    next();
});

var capteur = mongoose.model("capteur",capteurSchema);
module.exports = capteur;