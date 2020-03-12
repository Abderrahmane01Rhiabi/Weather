const mongoose = require('mongoose'); 

var weatherSchema = new mongoose.Schema({
        macAddCapt : {type : Number ,required: true, ref : 'Capteur'},
        dateOfcomming : { type: Date, default: Date.now },
        temp : {type : Number , /*required: true*/},
        humidite : {type : Number , /*required: true*/}
})

var weather = mongoose.model("weatherData",weatherSchema);
module.exports = weather;