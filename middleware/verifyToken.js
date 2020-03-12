const jwt = require('jsonwebtoken')
const secret = "secret";

module.exports = (req,res,next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        console.log(token)
        const decoded = jwt.verify(token, secret)
        console.log(decoded)
        res.adminData = decoded;
        console.log(res.adminData)
        next();
    }catch(error){
        return res.status(401).json({
            message : 'You cant'
        })
    }
}