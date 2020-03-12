const mongoose = require('mongoose'); 

var tokenSchema = new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, //j ai change sa user => User
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
})

var token = mongoose.model("token",tokenSchema);
module.exports = token;