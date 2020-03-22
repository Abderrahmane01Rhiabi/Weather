const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middleware/verifyToken')
var _ = require('lodash');

const secret = "secret";

//Models
const Capteur = require('../../models/capteurs');
const Weather = require('../../models/weather');

router.post('/addCapteur', function(req,res){
    console.log('1')
    console.log(req.body.macAddr)

    Capteur.findOne({macAddr : req.body.macAddr})
    .exec()
    .then(capt => {
        console.log('2')
        if (capt){
            console.log('0')
            return res.status(409).json({
                message : 'Capteur Existe'
            });
        } else {
            console.log('3')
            console.log(req.body.name)
            console.log(req.body.place)
            console.log(req.body.macAddr)
            var data = {
                    "name" : req.body.name,
                    "place" : req.body.place,
                    "macAddr" : req.body.macAddr
                     }
                var newCapt = new Capteur(data);  
                console.log('4')   
                newCapt.save()
                .then(result => {
                    console.log('5')   
                    console.log(result);
                    res.status(201).json({
                        message : "Capteur added"
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                })
            }
       
        });
});

router.delete('/deleteCapteur',(req,res) => {
    Capteur.remove({macAddr : req.body.macAddr}).exec()
    .then(result => {
        //si le id nexiste pas il va affiche le 2em massage car lenght est >1
        if(result.deletedCount >= 1){
            console.log(result)
            res.status(200).json({
                message : "Capteur Deleted"
            }) 
        }else{
            console.log(result)
            res.status(404).json({
                message : "Capteur Not Founded"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.put('/updateCapteur',function (req, res, next) {

    Capteur.findOne({macAddr : req.body.macAddr}, function(err, post) {
        if (err) return next(err);
        if(req.body){
        _.assign(post, req.body); 
        post.save(function(err) {
            if (err) return next(err);
         res.status(201).json({
             message : "Data Modifye"
         });
                // return res.json(200, post);
        })
    }else{
        res.status(404).json({
            message : "No Data Modifye"
        });
    }
    });
});

router.post('/weatherData/:macAddCapt/:temp/:humi',(req,res) =>{
    Weather.find({macAddCapt : req.params.macAddCapt }).exec()
    .then(result => {
            if(!result){
                return res.status(409).json({
                    message : 'Capteur Is Not Existe'
                });
            }
            else{
                var data = {
                    "macAddCapt" : req.params.macAddCapt,
                    "temp" : req.params.temp,
                    "humidite" : req.params.humi 
                }
                var newData = new Weather(data)
                newData.save()
                .then(data => {
                    res.status(200).json({
                        message : "data arrive"
                    })
                })
            }
    }).catch(err =>{
        return res.status(500).json({
            error : err
        });
    })
})

router.get('/temp&humi/:macAddCapt/day',(req,res) => {
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        if(data){
            console.log(data.length)
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get('/temp&humi/:macAddCapt/week',(req,res) => {
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (7*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        console.log(data.length)
        if(data){
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get('/temp&humi/:macAddCapt/month',(req,res) => {
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (30*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1,dateOfcomming : 1}).sort('dateOfcomming').exec()
    .then(data => {
        console.log(data.length)
        if(data){
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get('/temp&humi/:macAddCapt/now',(req,res) => {
    var date = new Date()
    Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : date},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        console.log(data.length)
        if(data){

            res.status(200).json({
                      "humidite" : data.humidite,
                      "temp" : data.temp
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get("/weather", function(req,res) {
    Weather.find({}).populate('macAddCapt','macAddr')
    .then(function(dbProducts) {
      res.json(dbProducts);
    })
    .catch(function(err) {
      res.json(err);
    })
  });

  router.get("/capteur", function(req,res) {
    Capteur.find({})
    .then(function(dbReviews) {
      res.json(dbReviews);
    })
    .catch(function(err) {
      res.json(err);
    })
  });  


router.get("/xxx"  ,(req,res) =>{
    // var date = new Date()
    // console.log(date)
    // var datee = new Date(date - (24*60*60*1000))
    // console.log(datee)
    // var START = new Date()
    // var END = new Date(new Date() - (8*24*60*60*1000))
    // var date = new Date(new Date(START).setHours(00,00,00,00))
    // var datee = new Date(new Date(END).setHours(23,59,59,999))
    // console.log(date)
    // console.log(datee)
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (7*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    
})
module.exports = router;
