const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
    firstname: {type : String, required: true},
    lastname: {type : String, required: true},
    email: {type : String,
            unique:true, 
            required: true, 
            match:/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
           },
    password: {type : String, required: true},
    role : {type : String , default : "user"},
    isVerified: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date
})
/*

*/
//ajouter apartire dun site
userSchema.pre('save',  function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
       //     user.verify = hash
            next();
        });
    });
});

var user = mongoose.model("user",userSchema);
module.exports = user;