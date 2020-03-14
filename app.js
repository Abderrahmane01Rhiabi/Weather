const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors'); // addition we make

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const port = 3080;
//Connection de base de donnes
//mongoose.connect('mongodb+srv://<'+process.env.MONGOATLAS_USERNAME+'>:<'+process.env.MONGOATLAS_PASSWORD+'>@rh-2aapw.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true });
// mongoose.connect("mongodb://rhiabi:rhiabi@rh-shard-00-00-2aapw.mongodb.net:27017,rh-shard-00-01-2aapw.mongodb.net:27017,rh-shard-00-02-2aapw.mongodb.net:27017/OurApp?ssl=true&replicaSet=RH-shard-0&authSource=admin&retryWrites=true&w=majority"
// , { useNewUrlParser: true });

mongoose.connect("mongodb://localhost:27017/OurDB", { useNewUrlParser: true });
//Connection event
mongoose.connection.on('connected',function(){
    console.log('Base De Donne Connecte');
})

mongoose.connection.on('error',function(err){
    console.log('error in MongoDB connection '+err);
})

mongoose.connection.on('disconnected',function(){
    console.log('Base De Donne Disactive');
})
//-------------------------------------------------
// Use CORS and File Upload modules here
app.use(cors());
app.use(fileUpload());

//set view engin
//app.set('view engine','ejs');
//app.set('views', path.join(__dirname,'/views'));

//Middlewares
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json());
//Serve static files from /public
app.use(express.static(path.join(__dirname,'/public')));

//Routes
const pageAdmin = require('./routes/admin/pageAdmin');
const pageUser = require('./routes/user/pageUser')
const pageCapteur = require('./routes/capteur/pageCapteur')

app.use('/admin', pageAdmin); //admin
app.use('/user', pageUser); //user
app.use('/capteur',pageCapteur);

app.listen(port, function(){
    console.log(`listening on port ${port}`);
})
